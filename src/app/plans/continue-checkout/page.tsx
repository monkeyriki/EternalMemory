import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  parseMemorialPlanCheckoutSku
} from "@/lib/memorialStripeHosting";
import type { PlansTier } from "@/lib/plansTier";

function parsePlansTier(searchParams?: {
  plan?: string | string[];
  sku?: string | string[];
}): PlansTier | null {
  const rawPlan = searchParams?.plan;
  const plan =
    typeof rawPlan === "string" ? rawPlan : Array.isArray(rawPlan) ? rawPlan[0] : "";
  if (plan === "premium" || plan === "lifetime") return plan;

  const rawSku = searchParams?.sku;
  const skuStr =
    typeof rawSku === "string" ? rawSku : Array.isArray(rawSku) ? rawSku[0] : "";
  const sku = parseMemorialPlanCheckoutSku(skuStr);
  if (sku === "lifetime") return "lifetime";
  if (sku === "premium_monthly" || sku === "premium_yearly") return "premium";
  return null;
}

/**
 * Entry from /plans: sign-in → create memorial or pick memorial → upgrade (and optional payment).
 */
export default async function PlansContinueCheckoutPage({
  searchParams
}: {
  searchParams?: { plan?: string | string[]; sku?: string | string[] };
}) {
  const tier = parsePlansTier(searchParams);
  if (!tier) {
    redirect("/plans");
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const selfPath = `/plans/continue-checkout?plan=${encodeURIComponent(tier)}`;

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(selfPath)}`);
  }

  const { data: memorials } = await supabase
    .from("memorials")
    .select("id, slug, full_name")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const list = memorials ?? [];

  if (list.length === 0) {
    redirect(`/memorials/new?hosting=${encodeURIComponent(tier)}`);
  }

  if (list.length === 1) {
    const slug = list[0].slug?.trim().toLowerCase();
    if (!slug) redirect("/plans");
    if (tier === "premium") {
      redirect(`/memorials/${slug}/upgrade`);
    }
    redirect(`/memorials/${slug}/upgrade?autoCheckout=lifetime`);
  }

  redirect(`/plans/select-memorial?plan=${encodeURIComponent(tier)}`);
}
