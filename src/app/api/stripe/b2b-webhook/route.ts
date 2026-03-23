import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";
import { sendTransactionalEmail } from "@/lib/resendEmail";
import { b2bSubscriptionRenewalEmail } from "@/lib/emailTemplates";

export const runtime = "nodejs";

/** Stripe API uses snake_case; SDK typings may omit some fields in strict mode. */
function subscriptionPeriodBounds(sub: unknown): {
  startMs: number;
  endMs: number;
} {
  const o = sub as {
    current_period_start: number;
    current_period_end: number;
  };
  return {
    startMs: o.current_period_start * 1000,
    endMs: o.current_period_end * 1000
  };
}

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

      const subRaw = await stripe.subscriptions.retrieve(subId, {
        expand: ["items.data.price"]
      });
      const sub = subRaw as unknown as Stripe.Subscription;
      const { startMs, endMs } = subscriptionPeriodBounds(subRaw);

      const item = sub.items.data[0];
      const price = item?.price;
      const unitAmount = price?.unit_amount ?? 0;
      const currency = (price?.currency ?? "usd").toLowerCase();
      const planName =
        (price && typeof price === "object" && "nickname" in price && price.nickname) ||
        "B2B Monthly";

      const status = mapStripeSubscriptionStatus(sub.status);
      const start = new Date(startMs).toISOString();
      const end = new Date(endMs).toISOString();

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
      const subWithPriceRaw = await stripe.subscriptions.retrieve(sub.id, {
        expand: ["items.data.price"]
      });
      const subWithPrice = subWithPriceRaw as unknown as Stripe.Subscription;
      const item = subWithPrice.items.data[0];
      const price = item?.price;
      const unitAmount = price?.unit_amount ?? 0;
      const cur = (price?.currency ?? "usd").toLowerCase();

      const { data: row } = await admin
        .from("b2b_subscriptions")
        .select("account_id, current_period_end")
        .eq("provider_subscription_id", sub.id)
        .maybeSingle();

      const accountId =
        row?.account_id ?? sub.metadata?.user_id ?? undefined;
      if (!accountId) {
        console.warn("b2b-webhook subscription.updated: unknown subscription", sub.id);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const { startMs, endMs } = subscriptionPeriodBounds(subWithPriceRaw);
      const status = mapStripeSubscriptionStatus(sub.status);
      const start = new Date(startMs).toISOString();
      const end = new Date(endMs).toISOString();
      const planName =
        (price && typeof price === "object" && "nickname" in price && price.nickname) ||
        "B2B Monthly";

      const previousEnd = row?.current_period_end ? String(row.current_period_end) : null;
      const endChanged = previousEnd ? previousEnd !== end : false;

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

      // System email: notify owner on renewal (only when end date changes and subscription is still active/trialing)
      if (
        endChanged &&
        (status === "active" || status === "trialing")
      ) {
        try {
          const { data: ownerAuth, error: ownerAuthErr } =
            await admin.auth.admin.getUserById(accountId);
          if (ownerAuthErr) {
            console.error("b2b-webhook renewal email: getUserById failed:", ownerAuthErr);
          } else {
            const ownerUser = ownerAuth?.user;
            const ownerEmail = ownerUser?.email?.trim();
            if (ownerEmail) {
              const meta = ownerUser?.user_metadata as
                | { full_name?: string }
                | undefined;
              const ownerName =
                meta?.full_name?.trim() ||
                ownerUser?.email?.split("@")[0] ||
                "there";
              const appUrl =
                process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://eternalmemory.app";
              const content = b2bSubscriptionRenewalEmail({
                ownerName,
                planName,
                currentPeriodEndIso: end,
                appUrl
              });
              const send = await sendTransactionalEmail({
                to: ownerEmail,
                subject: content.subject,
                html: content.html,
                text: content.text
              });
              if (!send.ok && !send.skipped) {
                console.error("b2b-webhook renewal email failed:", send.error);
              }
            }
          }
        } catch (emailErr) {
          console.error("b2b-webhook renewal email block error:", emailErr);
        }
      }

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
