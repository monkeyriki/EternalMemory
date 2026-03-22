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

export default async function AdminPage() {
  const [memorialsCount, usersCount, tributesCount, pendingCount] =
    await Promise.all([
      getCount("memorials"),
      getCount("profiles"),
      getCount("virtual_tributes"),
      // Free-text guest messages awaiting owner/admin approval (guestbook / virtual tributes)
      getCount("virtual_tributes", {
        filter: (q) => q.eq("is_approved", false).is("store_item_id", null)
      })
    ]);

  const stats = [
    { label: "Total memorials", value: memorialsCount },
    { label: "Total users", value: usersCount },
    { label: "Total tributes", value: tributesCount },
    { label: "Pending guestbook messages", value: pendingCount }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Admin dashboard
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Overview of platform activity.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
