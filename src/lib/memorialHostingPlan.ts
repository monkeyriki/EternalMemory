/** Matches DB enum `memorial_hosting_plan`. */
export type MemorialHostingPlan = "basic" | "premium" | "lifetime";

/**
 * Premium reverts to Basic when `plan_expires_at` is in the past (Stripe subscription lapsed).
 */
export function getEffectiveHostingPlan(input: {
  hosting_plan?: string | null;
  plan_expires_at?: string | null;
}): MemorialHostingPlan {
  const raw = input.hosting_plan ?? "basic";
  if (raw === "lifetime") return "lifetime";
  if (raw === "premium") {
    if (!input.plan_expires_at) return "premium";
    const t = new Date(input.plan_expires_at).getTime();
    if (!Number.isFinite(t)) return "premium";
    return t > Date.now() ? "premium" : "basic";
  }
  return "basic";
}

export const MEMORIAL_HOSTING_PLANS: MemorialHostingPlan[] = [
  "basic",
  "premium",
  "lifetime"
];

export function isMemorialHostingPlan(v: string | null | undefined): v is MemorialHostingPlan {
  return v === "basic" || v === "premium" || v === "lifetime";
}

/** Max gallery images (excluding cover) for Basic — ForeverMissed-style cap. */
export const BASIC_PLAN_MAX_GALLERY_IMAGES = 5;

/** Premium / Lifetime gallery cap (existing product limit). */
export const PAID_PLAN_MAX_GALLERY_IMAGES = 24;

export function maxGalleryImagesForPlan(plan: string | null | undefined): number {
  return plan === "premium" || plan === "lifetime"
    ? PAID_PLAN_MAX_GALLERY_IMAGES
    : BASIC_PLAN_MAX_GALLERY_IMAGES;
}

export function maxGalleryImagesForMemorial(input: {
  hosting_plan?: string | null;
  plan_expires_at?: string | null;
}): number {
  return maxGalleryImagesForPlan(getEffectiveHostingPlan(input));
}

/** Platform AdSense slots: only Basic shows ads (when global ads on), unless owner enabled ads_free. */
export function memorialEligibleForPlatformAds(input: {
  ads_free?: boolean | null;
  hosting_plan?: string | null;
  plan_expires_at?: string | null;
}): boolean {
  if (input.ads_free === true) return false;
  const p = getEffectiveHostingPlan(input);
  if (p === "premium" || p === "lifetime") return false;
  return true;
}

/** Premium subscription still active (or lifetime). */
export function memorialPaidHostingActive(input: {
  hosting_plan?: string | null;
  plan_expires_at?: string | null;
}): boolean {
  if (input.hosting_plan === "lifetime") return true;
  if (input.hosting_plan !== "premium") return false;
  if (!input.plan_expires_at) return true;
  const t = new Date(input.plan_expires_at).getTime();
  return Number.isFinite(t) && t > Date.now();
}
