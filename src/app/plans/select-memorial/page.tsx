import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import type { PlansTier } from "@/lib/plansTier";

export const metadata = {
  title: "Choose memorial | EternalMemory",
  description: "Select which memorial to upgrade."
};

function parsePlansTier(searchParams?: {
  plan?: string | string[];
}): PlansTier | null {
  const raw = searchParams?.plan;
  const p = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  if (p === "premium" || p === "lifetime") return p;
  return null;
}

function planTitle(tier: PlansTier): string {
  return tier === "lifetime" ? "Lifetime" : "Premium";
}

export default async function PlansSelectMemorialPage({
  searchParams
}: {
  searchParams?: { plan?: string | string[] };
}) {
  const tier = parsePlansTier(searchParams);
  if (!tier) {
    redirect("/plans");
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const returnPath = `/plans/select-memorial?plan=${encodeURIComponent(tier)}`;

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

  return (
    <MemorialPageShell
      title="Which memorial?"
      subtitle={`Choose a memorial for ${planTitle(tier)} hosting.`}
      maxWidth="2xl"
      contentClassName="mt-6"
    >
      <ul className="space-y-3">
        {list.map((m) => {
          const slug = m.slug?.trim().toLowerCase();
          if (!slug) return null;
          const href =
            tier === "premium"
              ? `/memorials/${slug}/upgrade`
              : `/memorials/${slug}/upgrade?autoCheckout=lifetime`;
          return (
            <li key={m.id}>
              <Link
                href={href}
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
