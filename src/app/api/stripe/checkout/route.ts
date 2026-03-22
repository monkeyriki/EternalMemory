import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { stripe } from "@/lib/stripe";
import { assertPasswordMemorialInteractionAllowed } from "@/lib/memorialPasswordAccess";
import { sanitizeTributeCheckoutMessage } from "@/lib/sanitizeTributeCheckoutMessage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    let body: any;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const memorialId = body?.memorial_id as string | undefined;
    const memorialSlug = body?.memorial_slug as string | undefined;
    const storeItemId = body?.store_item_id as string | undefined;
    const optionalMessage = sanitizeTributeCheckoutMessage(body?.optional_message);

    if (!memorialId || !memorialSlug || !storeItemId) {
      return NextResponse.json(
        { ok: false, error: "Missing memorial_id, memorial_slug, or store_item_id" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
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

    const purchaserId = user?.id ?? "guest";

    const { data: memorial } = await supabase
      .from("memorials")
      .select("id")
      .eq("id", memorialId)
      .maybeSingle();

    if (!memorial) {
      return NextResponse.json(
        { ok: false, error: "Memorial not found." },
        { status: 404 }
      );
    }

    const gate = await assertPasswordMemorialInteractionAllowed(memorialId);
    if (!gate.ok) {
      return NextResponse.json({ ok: false, error: gate.error }, { status: 403 });
    }

    const { data: storeItem } = await supabase
      .from("store_items")
      .select("id, name, price_cents, currency, image_url, is_premium, is_active")
      .eq("id", storeItemId)
      .eq("is_active", true)
      .maybeSingle();

    if (!storeItem) {
      return NextResponse.json(
        { ok: false, error: "Store item not available." },
        { status: 404 }
      );
    }

    const currency = (storeItem.currency ?? "usd").toLowerCase();
    const unitAmount = storeItem.price_cents;
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid store item price." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            product_data: {
              name: storeItem.name ?? "Virtual tribute",
              images: storeItem.image_url ? [storeItem.image_url] : []
            },
            unit_amount: unitAmount
          }
        }
      ],
      mode: "payment",
      success_url: `${appUrl}/memorials/${memorialSlug}?tribute=success`,
      cancel_url: `${appUrl}/memorials/${memorialSlug}?tribute=cancelled`,
      metadata: {
        memorial_id: memorialId,
        memorial_slug: memorialSlug,
        store_item_id: storeItemId,
        purchaser_id: purchaserId,
        ...(optionalMessage ? { optional_message: optionalMessage } : {})
      }
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: "Stripe session URL missing." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (err) {
    console.error("Stripe checkout creation failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to start checkout." },
      { status: 500 }
    );
  }
}

