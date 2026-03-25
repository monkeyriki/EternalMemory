import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

/** Stripe SDK typings vary by version; read period end from expanded object. */
function subscriptionPeriodEndUnix(sub: unknown): number | undefined {
  if (!sub || typeof sub !== "object") return undefined;
  const v = (sub as { current_period_end?: unknown }).current_period_end;
  return typeof v === "number" ? v : undefined;
}

/** Stripe Checkout Session.metadata.checkout_kind */
export const MEMORIAL_HOSTING_CHECKOUT_KIND = "memorial_hosting";

export type MemorialHostingCheckoutTarget = "premium" | "lifetime";

export type MemorialPlanCheckoutSku =
  | "premium_monthly"
  | "premium_yearly"
  | "lifetime";

const MEMORIAL_PLAN_CHECKOUT_SKUS: MemorialPlanCheckoutSku[] = [
  "premium_monthly",
  "premium_yearly",
  "lifetime"
];

/** Validates query params (plans flow, upgrade redirects). */
export function parseMemorialPlanCheckoutSku(
  v: string | undefined | null
): MemorialPlanCheckoutSku | null {
  if (!v || typeof v !== "string") return null;
  return MEMORIAL_PLAN_CHECKOUT_SKUS.includes(v as MemorialPlanCheckoutSku)
    ? (v as MemorialPlanCheckoutSku)
    : null;
}

export function memorialHostingPriceIdForSku(
  sku: MemorialPlanCheckoutSku
): string | null {
  const monthly = process.env.STRIPE_PRICE_MEMORIAL_PREMIUM_MONTHLY?.trim();
  const yearly = process.env.STRIPE_PRICE_MEMORIAL_PREMIUM_YEARLY?.trim();
  const lifetime = process.env.STRIPE_PRICE_MEMORIAL_LIFETIME?.trim();
  if (sku === "premium_monthly") return monthly || null;
  if (sku === "premium_yearly") return yearly || null;
  return lifetime || null;
}

export function hostingTargetForSku(
  sku: MemorialPlanCheckoutSku
): MemorialHostingCheckoutTarget {
  return sku === "lifetime" ? "lifetime" : "premium";
}

/**
 * Idempotent: same session id only applies once per memorial.
 * Verifies memorial owner matches metadata.
 */
export async function applyMemorialHostingFromCheckoutSession(
  session: Stripe.Checkout.Session,
  supabase: {
    from: (t: string) => any;
  }
): Promise<{ ok: true; skipped?: boolean } | { ok: false; error: string }> {
  const sessionId = session.id;
  const memorialId = session.metadata?.memorial_id;
  const ownerId = session.metadata?.owner_id;
  const hostingTarget = session.metadata?.hosting_target;

  if (
    typeof memorialId !== "string" ||
    typeof ownerId !== "string" ||
    (hostingTarget !== "premium" && hostingTarget !== "lifetime")
  ) {
    return { ok: false, error: "Invalid memorial hosting metadata" };
  }

  const { data: memorial, error: memErr } = await supabase
    .from("memorials")
    .select(
      "id, owner_id, hosting_plan, last_hosting_checkout_session_id, stripe_subscription_id"
    )
    .eq("id", memorialId)
    .maybeSingle();

  if (memErr || !memorial) {
    return { ok: false, error: "Memorial not found" };
  }
  if (memorial.owner_id !== ownerId) {
    return { ok: false, error: "Owner mismatch" };
  }
  if (memorial.last_hosting_checkout_session_id === sessionId) {
    return { ok: true, skipped: true };
  }
  if (memorial.hosting_plan === "lifetime") {
    return { ok: true, skipped: true };
  }

  const nowIso = new Date().toISOString();

  if (hostingTarget === "lifetime") {
    if (session.mode !== "payment") {
      return { ok: false, error: "Expected payment mode for lifetime" };
    }
    if (session.payment_status !== "paid") {
      return { ok: false, error: "Lifetime checkout not paid" };
    }
    const { error: upErr } = await supabase
      .from("memorials")
      .update({
        hosting_plan: "lifetime",
        plan_expires_at: null,
        stripe_subscription_id: null,
        last_hosting_checkout_session_id: sessionId,
        updated_at: nowIso
      })
      .eq("id", memorialId);
    if (upErr) {
      console.error("memorial hosting lifetime update failed:", upErr);
      return { ok: false, error: "DB update failed" };
    }
    return { ok: true };
  }

  if (session.mode !== "subscription") {
    return { ok: false, error: "Expected subscription mode for premium" };
  }
  const subRef = session.subscription;
  const subId =
    typeof subRef === "string" ? subRef : subRef && "id" in subRef ? subRef.id : null;
  if (!subId) {
    return { ok: false, error: "Missing subscription on checkout session" };
  }

  const retrieved = await stripe.subscriptions.retrieve(subId);
  const periodEndSec = subscriptionPeriodEndUnix(retrieved);
  if (!periodEndSec) {
    return { ok: false, error: "Invalid subscription period end" };
  }
  const planExpiresAt = new Date(periodEndSec * 1000).toISOString();

  const { error: upErr } = await supabase
    .from("memorials")
    .update({
      hosting_plan: "premium",
      stripe_subscription_id: subId,
      plan_expires_at: planExpiresAt,
      last_hosting_checkout_session_id: sessionId,
      updated_at: nowIso
    })
    .eq("id", memorialId);

  if (upErr) {
    console.error("memorial hosting premium update failed:", upErr);
    return { ok: false, error: "DB update failed" };
  }
  return { ok: true };
}

export async function syncMemorialPremiumFromSubscription(
  subscription: Stripe.Subscription,
  supabase: { from: (t: string) => any }
): Promise<void> {
  const subId = subscription.id;
  const status = subscription.status;
  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, hosting_plan")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();

  if (!memorial || memorial.hosting_plan !== "premium") {
    return;
  }

  const nowIso = new Date().toISOString();

  // Keep Premium in sync while Stripe still considers the subscription recoverable / active.
  if (status === "active" || status === "trialing" || status === "past_due") {
    const periodEndSec = subscriptionPeriodEndUnix(subscription);
    if (!periodEndSec) return;
    const planExpiresAt = new Date(periodEndSec * 1000).toISOString();
    await supabase
      .from("memorials")
      .update({
        plan_expires_at: planExpiresAt,
        updated_at: nowIso
      })
      .eq("id", memorial.id);
    return;
  }

  // Canceled, unpaid, incomplete, etc. — remove premium (Lifetime is unaffected: no subscription id).
  await supabase
    .from("memorials")
    .update({
      hosting_plan: "basic",
      stripe_subscription_id: null,
      plan_expires_at: null,
      updated_at: nowIso
    })
    .eq("id", memorial.id);
}
