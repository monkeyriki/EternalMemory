import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { stripe } from "@/lib/stripe";
import {
  MEMORIAL_HOSTING_CHECKOUT_KIND,
  hostingTargetForSku,
  memorialHostingPriceIdForSku,
  type MemorialPlanCheckoutSku
} from "@/lib/memorialStripeHosting";
import { memorialPaidHostingActive } from "@/lib/memorialHostingPlan";

export const runtime = "nodejs";

const SKUS: MemorialPlanCheckoutSku[] = [
  "premium_monthly",
  "premium_yearly",
  "lifetime"
];

function isSku(v: string): v is MemorialPlanCheckoutSku {
  return (SKUS as string[]).includes(v);
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const b = body as Record<string, unknown>;
    const memorialId = typeof b.memorial_id === "string" ? b.memorial_id : "";
    const memorialSlug =
      typeof b.memorial_slug === "string" ? b.memorial_slug.trim().toLowerCase() : "";
    const sku = typeof b.plan === "string" ? b.plan : "";

    if (!memorialId || !memorialSlug || !isSku(sku)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing memorial_id, memorial_slug, or valid plan (premium_monthly | premium_yearly | lifetime)."
        },
        { status: 400 }
      );
    }

    const priceId = memorialHostingPriceIdForSku(sku);
    if (!priceId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Stripe price not configured. Set STRIPE_PRICE_MEMORIAL_PREMIUM_MONTHLY, STRIPE_PRICE_MEMORIAL_PREMIUM_YEARLY, and STRIPE_PRICE_MEMORIAL_LIFETIME."
        },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
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
      return NextResponse.json(
        { ok: false, error: "You must be signed in." },
        { status: 401 }
      );
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const isAdmin = profile?.role === "admin";

    const { data: memorial, error: memErr } = await supabase
      .from("memorials")
      .select("id, slug, owner_id, hosting_plan, plan_expires_at")
      .eq("id", memorialId)
      .maybeSingle();

    if (memErr || !memorial) {
      return NextResponse.json(
        { ok: false, error: "Memorial not found." },
        { status: 404 }
      );
    }

    if (memorial.owner_id !== user.id && !isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Only the memorial owner or an admin can upgrade hosting." },
        { status: 403 }
      );
    }

    if (memorial.slug?.toLowerCase() !== memorialSlug) {
      return NextResponse.json(
        { ok: false, error: "Memorial slug mismatch." },
        { status: 400 }
      );
    }

    if (memorial.hosting_plan === "lifetime") {
      return NextResponse.json(
        { ok: false, error: "This memorial already has Lifetime hosting." },
        { status: 400 }
      );
    }

    if (
      sku !== "lifetime" &&
      memorialPaidHostingActive({
        hosting_plan: memorial.hosting_plan,
        plan_expires_at: memorial.plan_expires_at
      })
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Premium is already active. Manage billing from your Stripe customer portal (coming soon) or wait until it expires."
        },
        { status: 400 }
      );
    }

    const hostingTarget = hostingTargetForSku(sku);
    const mode = sku === "lifetime" ? "payment" : "subscription";

    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/memorials/${memorialSlug}/upgrade?checkout=success`,
      cancel_url: `${appUrl}/memorials/${memorialSlug}/upgrade?checkout=cancelled`,
      metadata: {
        checkout_kind: MEMORIAL_HOSTING_CHECKOUT_KIND,
        memorial_id: memorialId,
        memorial_slug: memorialSlug,
        owner_id: memorial.owner_id,
        hosting_target: hostingTarget,
        plan_sku: sku
      },
      ...(mode === "subscription"
        ? {
            subscription_data: {
              metadata: {
                checkout_kind: MEMORIAL_HOSTING_CHECKOUT_KIND,
                memorial_id: memorialId,
                owner_id: memorial.owner_id
              }
            }
          }
        : {})
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: "Stripe session URL missing." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (err) {
    console.error("memorial-plan-checkout failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to start checkout." },
      { status: 500 }
    );
  }
}
