import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import {
  parseMemorialPlanCheckoutSku,
  type MemorialPlanCheckoutSku
} from "@/lib/memorialStripeHosting";

export const metadata = {
  title: "Choose memorial — checkout | EternalMemory",
  description: "Select which memorial to upgrade with your chosen plan."
};

function skuFromSearchParams(searchParams?: {
  sku?: string | string[];
}): MemorialPlanCheckoutSku | null {
  const raw = searchParams?.sku;
  const s = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  return parseMemorialPlanCheckoutSku(s);
}

function planTitle(sku: MemorialPlanCheckoutSku): string {
  switch (sku) {
    case "premium_monthly":
      return "Premium (monthly)";
    case "premium_yearly":
      return "Premium (yearly)";
    case "lifetime":
      return "Lifetime";
    default:
      return "Paid plan";
  }
}

export default async function PlansSelectMemorialPage({
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

  const returnPath = `/plans/select-memorial?sku=${encodeURIComponent(sku)}`;

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(returnPath)}`);
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

  return (
    <MemorialPageShell
      title="Which memorial?"
      subtitle={`Choose a memorial to apply ${planTitle(sku)}. You will be redirected to secure checkout.`}
      maxWidth="2xl"
      contentClassName="mt-6"
    >
      <ul className="space-y-3">
        {list.map((m) => {
          const slug = m.slug?.trim().toLowerCase();
          if (!slug) return null;
          return (
            <li key={m.id}>
              <Link
                href={`/memorials/${slug}/upgrade?autoCheckout=${encodeURIComponent(sku)}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-4 text-left shadow-sm transition hover:border-amber-200/80 hover:shadow-md"
              >
                <span className="font-serif text-lg font-semibold text-slate-900">
                  {m.full_name}
                </span>
                <span className="text-sm font-semibold text-amber-800">
                  Continue →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-center text-sm text-slate-600">
        <Link
          href="/plans"
          className="font-medium text-amber-800 underline-offset-4 hover:underline"
        >
          Back to plans
        </Link>
      </p>
    </MemorialPageShell>
  );
}
