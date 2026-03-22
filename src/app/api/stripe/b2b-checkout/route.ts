import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { stripe } from "@/lib/stripe";
import { assertIpNotBannedFromHeaders } from "@/lib/ipBanCheck";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ipBlock = await assertIpNotBannedFromHeaders(req.headers);
    if (!ipBlock.ok) {
      return NextResponse.json(
        { ok: false, error: ipBlock.error },
        { status: 403 }
      );
    }

    const priceId = process.env.STRIPE_B2B_PRICE_ID?.trim();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (!priceId) {
      return NextResponse.json(
        { ok: false, error: "Missing STRIPE_B2B_PRICE_ID" },
        { status: 500 }
      );
    }
    if (!appUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing NEXT_PUBLIC_APP_URL" },
        { status: 500 }
      );
    }

    const supabase = await getSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    let body: { plan?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    if (body.plan !== "monthly") {
      return NextResponse.json(
        { ok: false, error: "Invalid plan" },
        { status: 400 }
      );
    }

    const { data: activeSub } = await supabase
      .from("b2b_subscriptions")
      .select("id")
      .eq("account_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (activeSub) {
      return NextResponse.json(
        { ok: false, error: "You already have an active B2B subscription." },
        { status: 400 }
      );
    }

    const base = appUrl.replace(/\/$/, "");
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/dashboard/b2b?subscription=success`,
      cancel_url: `${base}/dashboard/b2b?subscription=cancelled`,
      metadata: {
        user_id: user.id,
        plan: "monthly"
      },
      subscription_data: {
        metadata: {
          user_id: user.id
        }
      }
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("b2b-checkout error:", err);
    return NextResponse.json(
      { ok: false, error: "Checkout failed" },
      { status: 500 }
    );
  }
}
