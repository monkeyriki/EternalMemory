import { getSupabaseServerClient } from "@/lib/supabaseServer";
import MemorialCard from "@/components/memorial/MemorialCard";
import DirectoryFilters from "@/components/memorial/DirectoryFilters";
import Link from "next/link";
import { notFound } from "next/navigation";

type SearchParams = {
  search?: string;
  city?: string;
  sort?: string;
  page?: string;
};

function buildQueryString(params: SearchParams, page?: number): string {
  const q = new URLSearchParams();
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.city?.trim()) q.set("city", params.city.trim());
  if (params.sort && params.sort !== "recent") q.set("sort", params.sort);
  if (page != null && page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export default async function MemorialsHumansPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const pageSize = 10;
  const pageRaw = searchParams?.page ?? "1";
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const from = (page - 1) * pageSize;

  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("memorials")
    .select("id, slug, type, full_name, date_of_birth, date_of_death, city")
    .eq("type", "human")
    .eq("visibility", "public")
    .eq("is_draft", false);

  if (searchParams?.search?.trim()) {
    query = query.ilike("full_name", `%${searchParams.search.trim()}%`);
  }
  if (searchParams?.city?.trim()) {
    query = query.ilike("city", `%${searchParams.city.trim()}%`);
  }
  if (searchParams?.sort === "alpha") {
    query = query.order("full_name", { ascending: true });
  } else if (searchParams?.sort === "updated") {
    query = query.order("updated_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: memorials } = await query.range(from, from + pageSize - 1);

  if (!memorials) return notFound();

  const basePath = "/memorials/humans";
  const hasFilters =
    searchParams?.search?.trim() ||
    searchParams?.city?.trim() ||
    (searchParams?.sort && searchParams.sort !== "recent");

  return (
    <div className="min-h-[60vh] bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Human memorials
        </h1>
        <p className="mt-2 text-slate-600">
          Browse public, published memorials.
        </p>

        <DirectoryFilters
          currentSearch={searchParams?.search}
          currentCity={searchParams?.city}
          currentSort={searchParams?.sort}
        />

        {memorials.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            {hasFilters ? (
              <>
                <p className="text-slate-600">No memorials match your search.</p>
                <Link
                  href={basePath}
                  className="mt-2 inline-block text-sm text-slate-500 underline hover:text-slate-700"
                >
                  Clear filters
                </Link>
              </>
            ) : (
              <p className="text-slate-600">No memorials found yet.</p>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memorials.map((m) => (
              <MemorialCard
                key={m.id}
                name={m.full_name}
                type={m.type}
                dateOfBirth={m.date_of_birth}
                dateOfDeath={m.date_of_death}
                city={m.city}
                slug={m.slug}
              />
            ))}
          </div>
        )}

        <nav
          className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6"
          aria-label="Pagination"
        >
          <div>
            {page > 1 ? (
              <Link
                href={`${basePath}${buildQueryString(searchParams ?? {}, page - 1)}`}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-block rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-sm text-slate-400">
                Previous
              </span>
            )}
          </div>
          <div>
            {memorials.length === pageSize ? (
              <Link
                href={`${basePath}${buildQueryString(searchParams ?? {}, page + 1)}`}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Next
              </Link>
            ) : (
              <span className="inline-block rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-sm text-slate-400">
                Next
              </span>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
