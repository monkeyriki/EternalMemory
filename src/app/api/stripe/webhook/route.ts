import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";
import { sendTransactionalEmail } from "@/lib/resendEmail";
import {
  tributePurchasedOwnerEmail,
  tributeReceiptEmail
} from "@/lib/emailTemplates";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }
  if (!serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const session = event.data.object;
    const providerSessionId = session?.id as string | undefined;
    if (!providerSessionId) {
      return NextResponse.json({ ok: false, error: "Missing provider_session_id" }, { status: 400 });
    }

    const memorialId = session.metadata?.memorial_id as string | undefined;
    const storeItemId = session.metadata?.store_item_id as string | undefined;
    const purchaserId = session.metadata?.purchaser_id as string | undefined;

    if (!memorialId || !purchaserId || !storeItemId) {
      return NextResponse.json(
        { ok: false, error: "Missing memorial_id, purchaser_id, or store_item_id in stripe metadata" },
        { status: 400 }
      );
    }
    const amountCents = session.amount_total as number | null;
    const currency = session.currency as string | null;
    if (amountCents === null || !currency) {
      return NextResponse.json(
        { ok: false, error: "Missing amount_total or currency in stripe session" },
        { status: 400 }
      );
    }

    const buyerEmail = session.customer_details?.email ?? null;
    const purchaserUserId = purchaserId !== "guest" ? purchaserId : null;

    const supabase = getSupabaseAdminClient() as any;

    // Idempotency: only insert once per Stripe checkout session.
    const { data: existingOrder, error: existingErr } = await supabase
      .from("orders")
      .select("id, provider_session_id")
      .eq("provider_session_id", providerSessionId)
      .maybeSingle();

    if (existingErr) {
      console.error("Stripe webhook orders idempotency check failed:", existingErr);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    if (existingOrder) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { data: insertedOrder, error: insertErr } = await supabase
      .from("orders")
      .insert({
        memorial_id: memorialId,
        user_id: purchaserUserId,
        provider: "stripe",
        provider_session_id: providerSessionId,
        provider_payment_id: null,
        guest_token: null,
        amount_cents: amountCents,
        currency: currency,
        status: "paid",
        buyer_email: buyerEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .maybeSingle();

    if (insertErr) {
      console.error("Stripe webhook orders insert failed (check NOT NULL columns):", insertErr);
      return NextResponse.json(
        { ok: false, error: "Orders insert failed" },
        { status: 500 }
      );
    }

    const orderId = insertedOrder?.id;
    if (!orderId) {
      console.error("Stripe webhook expected inserted order id, got:", insertedOrder);
      return NextResponse.json({ ok: false, error: "Orders insert did not return an id" }, { status: 500 });
    }

    const { data: storeItem, error: storeItemErr } = await supabase
      .from("store_items")
      .select("id, name, is_premium")
      .eq("id", storeItemId)
      .maybeSingle();

    if (storeItemErr) {
      console.error("Stripe webhook store_items fetch failed:", storeItemErr);
      return NextResponse.json({ ok: false, error: "Failed to fetch store item" }, { status: 500 });
    }

    if (!storeItem) {
      return NextResponse.json({ ok: false, error: "Store item not found" }, { status: 404 });
    }

    const highlightUntil = storeItem.is_premium
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error: tributeInsertErr } = await supabase.from("virtual_tributes").insert({
      memorial_id: memorialId,
      purchaser_id: purchaserUserId,
      message: null,
      order_id: orderId,
      store_item_id: storeItemId,
      guest_name: null,
      is_approved: true,
      highlight_until: highlightUntil
    });

    if (tributeInsertErr) {
      console.error("Stripe webhook virtual_tributes insert failed:", tributeInsertErr);
      return NextResponse.json({ ok: false, error: "Virtual tribute insert failed" }, { status: 500 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://eternalmemory.app";
    const itemName = storeItem.name?.trim() || "Tribute";

    try {
      const { data: memorial } = await supabase
        .from("memorials")
        .select("owner_id, full_name, slug")
        .eq("id", memorialId)
        .maybeSingle();

      const memorialName = memorial?.full_name?.trim() || "Memorial";
      const memorialSlug =
        memorial?.slug?.trim() || String(memorialId);

      const purchaserEmail = session.customer_details?.email as
        | string
        | undefined;
      if (purchaserEmail?.trim()) {
        const receiptContent = tributeReceiptEmail({
          memorialName,
          memorialSlug,
          itemName,
          amount: amountCents,
          currency,
          appUrl
        });
        const receiptResult = await sendTransactionalEmail({
          to: purchaserEmail.trim(),
          subject: receiptContent.subject,
          html: receiptContent.html,
          text: receiptContent.text
        });
        if (!receiptResult.ok && !receiptResult.skipped) {
          console.error(
            "Stripe webhook: purchaser receipt email failed:",
            receiptResult.error
          );
        }
      }

      if (memorial?.owner_id) {
        const { data: ownerAuth, error: ownerAuthErr } =
          await supabase.auth.admin.getUserById(memorial.owner_id);
        if (ownerAuthErr) {
          console.error(
            "Stripe webhook: getUserById for memorial owner failed:",
            ownerAuthErr
          );
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
            const memorialName = memorial.full_name?.trim() || "Memorial";
            const memorialSlug = memorial.slug?.trim() || String(memorialId);
            const ownerContent = tributePurchasedOwnerEmail({
              ownerName,
              memorialName,
              memorialSlug,
              itemName,
              appUrl
            });
            const ownerResult = await sendTransactionalEmail({
              to: ownerEmail,
              subject: ownerContent.subject,
              html: ownerContent.html,
              text: ownerContent.text
            });
            if (!ownerResult.ok && !ownerResult.skipped) {
              console.error(
                "Stripe webhook: owner notification email failed:",
                ownerResult.error
              );
            }
          }
        }
      }
    } catch (emailErr) {
      console.error("Stripe webhook: email send block error:", emailErr);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

