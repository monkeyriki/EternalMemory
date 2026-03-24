import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import MemorialsAdminClient from "./MemorialsAdminClient";

const PAGE_SIZE = 25;

export default async function AdminMemorialsPage({
  searchParams
}: {
  searchParams?: { q?: string; page?: string };
}) {
  const supabase = await getSupabaseServerClient();
  const q = (searchParams?.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(searchParams?.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("memorials")
    .select("id, slug, full_name, owner_id, visibility, is_draft, created_at", {
      count: "exact"
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    const esc = q.replace(/[%_]/g, "\\$&");
    query = query.or(`full_name.ilike.%${esc}%,slug.ilike.%${esc}%`);
  }

  const { data: rows, count, error } = await query;

  if (error) {
    console.error("[AdminMemorialsPage]", error);
  }

  const memorials = rows ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Memorials (takedown)
      </h1>
      <p className="text-sm text-slate-600">
        Search all memorials and permanently delete abusive pages. This cannot be undone.
      </p>

      <div>
        <MemorialsAdminClient
          initialMemorials={memorials}
          total={total}
          page={page}
          totalPages={totalPages}
          initialQuery={q}
        />
      </div>

      <p className="text-xs text-slate-500">
        Tip: you can also remove a memorial from{" "}
        <Link
          href="/admin/reports"
          className="rounded-md text-amber-700 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          Reports
        </Link>{" "}
        when it was flagged.
      </p>
    </div>
  );
}
