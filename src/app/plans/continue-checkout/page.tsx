import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  parseMemorialPlanCheckoutSku,
  type MemorialPlanCheckoutSku
} from "@/lib/memorialStripeHosting";

function skuFromSearchParams(searchParams?: {
  sku?: string | string[];
}): MemorialPlanCheckoutSku | null {
  const raw = searchParams?.sku;
  const s = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  return parseMemorialPlanCheckoutSku(s);
}

/**
 * Entry from /plans paid CTAs: sends the user to Stripe checkout when possible,
 * or through create-memorial → upgrade, or memorial picker when needed.
 */
export default async function PlansContinueCheckoutPage({
  searchParams
}: {
  searchParams?: { sku?: string | string[] };
}) {
  const sku = skuFromSearchParams(searchParams);
  if (!sku) {
    redirect("/plans");
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const selfPath = `/plans/continue-checkout?sku=${encodeURIComponent(sku)}`;

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
    redirect(`/memorials/new?checkoutPlan=${encodeURIComponent(sku)}`);
  }

  if (list.length === 1) {
    const slug = list[0].slug?.trim().toLowerCase();
    if (!slug) redirect("/plans");
    redirect(
      `/memorials/${slug}/upgrade?autoCheckout=${encodeURIComponent(sku)}`
    );
  }

  redirect(`/plans/select-memorial?sku=${encodeURIComponent(sku)}`);
}
