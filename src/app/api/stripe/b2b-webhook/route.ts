import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): string {
  return status;
}

function shouldDemoteRole(status: Stripe.Subscription.Status): boolean {
  return (
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete_expired"
  );
}

async function upsertSubscriptionFromStripe(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  params: {
    accountId: string;
    providerSubscriptionId: string;
    planName: string;
    priceCents: number;
    currency: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  }
) {
  const { error } = await admin.from("b2b_subscriptions").upsert(
    {
      account_id: params.accountId,
      plan_name: params.planName,
      price_cents: params.priceCents,
      currency: params.currency,
      provider: "stripe",
      provider_subscription_id: params.providerSubscriptionId,
      status: params.status,
      current_period_start: params.currentPeriodStart,
      current_period_end: params.currentPeriodEnd
    },
    { onConflict: "provider_subscription_id" }
  );

  if (error) {
    console.error("b2b-webhook upsert b2b_subscriptions:", error);
    throw error;
  }
}

async function setProfileB2B(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  userId: string
) {
  const { error } = await admin
    .from("profiles")
    .update({ role: "b2b" })
    .eq("id", userId)
    .neq("role", "admin");

  if (error) {
    console.error("b2b-webhook profiles update b2b:", error);
    throw error;
  }
}

async function maybeDemoteToUser(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  userId: string
) {
  const { data: profile, error: readErr } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (readErr) {
    console.error("b2b-webhook read profile for demote:", readErr);
    return;
  }

  if (profile?.role === "b2b") {
    const { error } = await admin
      .from("profiles")
      .update({ role: "user" })
      .eq("id", userId);
    if (error) {
      console.error("b2b-webhook demote profile:", error);
    }
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_B2B_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("b2b-webhook: Missing STRIPE_B2B_WEBHOOK_SECRET");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (e) {
    console.error("b2b-webhook signature verification failed:", e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const admin = getSupabaseAdminClient();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") {
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const userId = session.metadata?.user_id;
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (!userId || !subId) {
        console.error("b2b-webhook checkout.session.completed missing metadata");
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const sub = await stripe.subscriptions.retrieve(subId, {
        expand: ["items.data.price"]
      });

      const item = sub.items.data[0];
      const price = item?.price;
      const unitAmount = price?.unit_amount ?? 0;
      const currency = (price?.currency ?? "usd").toLowerCase();
      const planName =
        (price && typeof price === "object" && "nickname" in price && price.nickname) ||
        "B2B Monthly";

      const status = mapStripeSubscriptionStatus(sub.status);
      const start = new Date(sub.current_period_start * 1000).toISOString();
      const end = new Date(sub.current_period_end * 1000).toISOString();

      await upsertSubscriptionFromStripe(admin, {
        accountId: userId,
        providerSubscriptionId: sub.id,
        planName,
        priceCents: unitAmount,
        currency,
        status,
        currentPeriodStart: start,
        currentPeriodEnd: end
      });

      if (status === "active" || status === "trialing") {
        await setProfileB2B(admin, userId);
      }
    } else if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const subWithPrice = await stripe.subscriptions.retrieve(sub.id, {
        expand: ["items.data.price"]
      });
      const item = subWithPrice.items.data[0];
      const price = item?.price;
      const unitAmount = price?.unit_amount ?? 0;
      const cur = (price?.currency ?? "usd").toLowerCase();

      const { data: row } = await admin
        .from("b2b_subscriptions")
        .select("account_id")
        .eq("provider_subscription_id", sub.id)
        .maybeSingle();

      const accountId =
        row?.account_id ?? sub.metadata?.user_id ?? undefined;
      if (!accountId) {
        console.warn("b2b-webhook subscription.updated: unknown subscription", sub.id);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const status = mapStripeSubscriptionStatus(sub.status);
      const start = new Date(sub.current_period_start * 1000).toISOString();
      const end = new Date(sub.current_period_end * 1000).toISOString();
      const planName =
        (price && typeof price === "object" && "nickname" in price && price.nickname) ||
        "B2B Monthly";

      await upsertSubscriptionFromStripe(admin, {
        accountId,
        providerSubscriptionId: sub.id,
        planName,
        priceCents: unitAmount,
        currency: cur,
        status,
        currentPeriodStart: start,
        currentPeriodEnd: end
      });

      if (shouldDemoteRole(sub.status)) {
        await maybeDemoteToUser(admin, accountId);
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const { data: row } = await admin
        .from("b2b_subscriptions")
        .select("account_id")
        .eq("provider_subscription_id", sub.id)
        .maybeSingle();

      const accountId = row?.account_id ?? sub.metadata?.user_id;
      if (accountId) {
        await admin
          .from("b2b_subscriptions")
          .update({ status: "canceled" })
          .eq("provider_subscription_id", sub.id);

        await maybeDemoteToUser(admin, accountId);
      }
    }
  } catch (err) {
    console.error("b2b-webhook handler error:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
