import { getSupabaseServerClient } from "@/lib/supabaseServer";

async function getCount(
  table: string,
  options?: { column?: string; filter?: (q: any) => any }
): Promise<number> {
  const supabase = await getSupabaseServerClient();
  let q = supabase.from(table).select(options?.column ?? "*", {
    count: "exact",
    head: true
  });
  if (options?.filter) q = options.filter(q);
  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatUsd(cents: number): string {
  return `USD ${(cents / 100).toFixed(2)}`;
}

export default async function AdminPage() {
  const [
    memorialsCount,
    usersCount,
    tributesCount,
    pendingCount,
    paidTributeRowsResult,
    upgradedMemorialsResult
  ] =
    await Promise.all([
      getCount("memorials"),
      getCount("profiles"),
      getCount("virtual_tributes"),
      // Free-text guest messages awaiting owner/admin approval (guestbook / virtual tributes)
      getCount("virtual_tributes", {
        filter: (q) => q.eq("is_approved", false).is("store_item_id", null)
      }),
      getSupabaseServerClient()
        .then((supabase) =>
          supabase
            .from("virtual_tributes")
            .select("id, order:order_id(amount_cents, currency, status)")
            .not("store_item_id", "is", null)
        )
        .then((res) => res.data ?? []),
      getSupabaseServerClient()
        .then((supabase) =>
          supabase
            .from("memorials")
            .select("id, hosting_plan, last_hosting_checkout_session_id")
            .neq("hosting_plan", "basic")
        )
        .then((res) => res.data ?? [])
    ]);

  const paidTributeRows = paidTributeRowsResult as Array<{
    id: string;
    order:
      | { amount_cents: number; currency: string; status: string }
      | Array<{ amount_cents: number; currency: string; status: string }>
      | null;
  }>;
  const upgradedMemorials = upgradedMemorialsResult as Array<{
    id: string;
    hosting_plan: "basic" | "premium" | "lifetime";
    last_hosting_checkout_session_id: string | null;
  }>;

  const paidTributes = paidTributeRows.filter((r) => {
    const order = one(r.order);
    return !!order && order.status === "paid";
  });
  const tributeSalesCount = paidTributes.length;
  const tributeSalesRevenueCents = paidTributes.reduce((sum, r) => {
    const order = one(r.order);
    return sum + (order?.amount_cents ?? 0);
  }, 0);

  const premiumUpgradesCount = upgradedMemorials.length;
  const premiumPlanCount = upgradedMemorials.filter(
    (m) => m.hosting_plan === "premium"
  ).length;
  const lifetimePlanCount = upgradedMemorials.filter(
    (m) => m.hosting_plan === "lifetime"
  ).length;
  const completedUpgradeCheckoutCount = upgradedMemorials.filter(
    (m) => !!m.last_hosting_checkout_session_id
  ).length;

  const stats = [
    { label: "Total memorials", value: memorialsCount },
    { label: "Total users", value: usersCount },
    { label: "Total tributes", value: tributesCount },
    { label: "Pending guestbook messages", value: pendingCount },
    { label: "Virtual item sales", value: tributeSalesCount },
    { label: "Virtual item revenue", value: formatUsd(tributeSalesRevenueCents) },
    { label: "Premium page upgrades", value: premiumUpgradesCount },
    { label: "Upgrade checkouts", value: completedUpgradeCheckoutCount },
    { label: "Premium plans", value: premiumPlanCount },
    { label: "Lifetime plans", value: lifetimePlanCount }
  ];

  return (
    <div className="space-y-6">
      <header>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Admin dashboard
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Overview of platform activity, virtual item sales, and premium page upgrades.
      </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm"
          >
            <p className="text-3xl font-bold text-slate-900">{String(s.value)}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
