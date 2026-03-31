import { getSupabaseServerClient } from "@/lib/supabaseServer";
import MemorialCard from "@/components/memorial/MemorialCard";
import DirectoryFilters from "@/components/memorial/DirectoryFilters";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import Link from "next/link";
import {
  buildMemorialDirectoryQueryString,
  directoryHasAdvancedFilters,
  parseTagsFilterParam,
  parseYearFilter,
  type MemorialDirectorySearchParams
} from "@/app/memorials/directoryParams";

export default async function MemorialsHumansPage({
  searchParams
}: {
  searchParams?: MemorialDirectorySearchParams;
}) {
  const pageSize = 10;
  const pageRaw = searchParams?.page ?? "1";
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const from = (page - 1) * pageSize;

  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("memorials")
    .select(
      "id, slug, type, full_name, date_of_birth, date_of_death, city, state, tags, story, cover_image_url"
    )
    .eq("type", "human")
    .eq("visibility", "public")
    .eq("is_draft", false);

  let countQuery = supabase
    .from("memorials")
    .select("id", { count: "exact", head: true })
    .eq("type", "human")
    .eq("visibility", "public")
    .eq("is_draft", false);

  if (searchParams?.search?.trim()) {
    query = query.ilike("full_name", `%${searchParams.search.trim()}%`);
    countQuery = countQuery.ilike("full_name", `%${searchParams.search.trim()}%`);
  }
  if (searchParams?.city?.trim()) {
    query = query.ilike("city", `%${searchParams.city.trim()}%`);
    countQuery = countQuery.ilike("city", `%${searchParams.city.trim()}%`);
  }
  if (searchParams?.state?.trim()) {
    query = query.ilike("state", `%${searchParams.state.trim()}%`);
    countQuery = countQuery.ilike("state", `%${searchParams.state.trim()}%`);
  }

  const bMin = parseYearFilter(searchParams?.birth_year_min);
  const bMax = parseYearFilter(searchParams?.birth_year_max);
  const dMin = parseYearFilter(searchParams?.death_year_min);
  const dMax = parseYearFilter(searchParams?.death_year_max);
  if (bMin != null) query = query.gte("birth_year", bMin);
  if (bMax != null) query = query.lte("birth_year", bMax);
  if (dMin != null) query = query.gte("death_year", dMin);
  if (dMax != null) query = query.lte("death_year", dMax);
  if (bMin != null) countQuery = countQuery.gte("birth_year", bMin);
  if (bMax != null) countQuery = countQuery.lte("birth_year", bMax);
  if (dMin != null) countQuery = countQuery.gte("death_year", dMin);
  if (dMax != null) countQuery = countQuery.lte("death_year", dMax);

  const tagFilters = parseTagsFilterParam(searchParams?.tags);
  if (tagFilters.length > 0) {
    query = query.overlaps("tags", tagFilters);
    countQuery = countQuery.overlaps("tags", tagFilters);
  }

  if (searchParams?.sort === "alpha") {
    query = query.order("full_name", { ascending: true });
  } else if (searchParams?.sort === "updated") {
    query = query.order("updated_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: memorials } = await query.range(from, from + pageSize - 1);
  const { count: totalCount } = await countQuery;
  const list = memorials ?? [];
  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const memorialIds = list.map((m) => m.id);
  const tributeCountByMemorialId = new Map<string, number>();
  const photoCountByMemorialId = new Map<string, number>();

  if (memorialIds.length > 0) {
    const { data: tributeRows } = await supabase
      .from("virtual_tributes")
      .select("memorial_id")
      .in("memorial_id", memorialIds)
      .eq("is_approved", true);
    for (const t of tributeRows ?? []) {
      const memorialId = (t as any).memorial_id as string;
      tributeCountByMemorialId.set(
        memorialId,
        (tributeCountByMemorialId.get(memorialId) ?? 0) + 1
      );
    }

    const { data: mediaRows } = await supabase
      .from("memorial_media")
      .select("memorial_id")
      .in("memorial_id", memorialIds);
    for (const media of mediaRows ?? []) {
      const memorialId = (media as any).memorial_id as string;
      photoCountByMemorialId.set(
        memorialId,
        (photoCountByMemorialId.get(memorialId) ?? 0) + 1
      );
    }
  }


  const basePath = "/memorials/humans";
  const hasFilters =
    searchParams?.search?.trim() ||
    searchParams?.city?.trim() ||
    searchParams?.state?.trim() ||
    (searchParams?.sort && searchParams.sort !== "recent") ||
    directoryHasAdvancedFilters(searchParams);

  return (
    <MemorialPageShell
      title="Human memorials"
      subtitle="Browse public, published memorials. Refine your search with the filters below."
      maxWidth="5xl"
      contentClassName="mt-6"
    >
        <DirectoryFilters
          currentSearch={searchParams?.search}
          currentCity={searchParams?.city}
          currentState={searchParams?.state}
          currentSort={searchParams?.sort}
          currentBirthYearMin={searchParams?.birth_year_min}
          currentBirthYearMax={searchParams?.birth_year_max}
          currentDeathYearMin={searchParams?.death_year_min}
          currentDeathYearMax={searchParams?.death_year_max}
          currentTags={searchParams?.tags}
        />

        {list.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white/95 p-8 text-center shadow-md shadow-slate-400/10 backdrop-blur">
            {hasFilters ? (
              <>
                <p className="text-slate-600">No memorials match your search.</p>
                <Link
                  href={basePath}
                  className="mt-2 inline-block rounded-md text-sm font-medium text-amber-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
                >
                  Clear filters
                </Link>
              </>
            ) : (
              <p className="text-slate-600">No memorials found yet.</p>
            )}
          </div>
        ) : (
          <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((m) => (
              <MemorialCard
                key={m.id}
                name={m.full_name}
                type={m.type}
                dateOfBirth={m.date_of_birth}
                dateOfDeath={m.date_of_death}
                description={m.story}
                city={m.city}
                slug={m.slug}
                tags={m.tags ?? []}
                tributeCount={tributeCountByMemorialId.get(m.id) ?? 0}
                photosCount={photoCountByMemorialId.get(m.id) ?? 0}
                coverImageUrl={m.cover_image_url}
              />
            ))}
          </div>
        )}

        <nav
          className="mt-10 flex items-center justify-between border-t border-slate-200/80 pt-8"
          aria-label="Pagination"
        >
          <div>
            {hasPrev ? (
              <Link
                href={`${basePath}${buildMemorialDirectoryQueryString(
                  searchParams ?? {},
                  currentPage - 1
                )}`}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
              >
                Previous
              </Link>
            ) : (
              <span
                className="inline-block cursor-not-allowed rounded-xl border border-slate-100 bg-slate-50/80 px-5 py-2.5 text-sm text-slate-400 opacity-70"
                aria-disabled="true"
                title="You are already on the first page."
              >
                Previous
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div>
            {hasNext ? (
              <Link
                href={`${basePath}${buildMemorialDirectoryQueryString(
                  searchParams ?? {},
                  currentPage + 1
                )}`}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
              >
                Next
              </Link>
            ) : (
              <span
                className="inline-block cursor-not-allowed rounded-xl border border-slate-100 bg-slate-50/80 px-5 py-2.5 text-sm text-slate-400 opacity-70"
                aria-disabled="true"
                title="No more memorials on the next page."
              >
                Next
              </span>
            )}
          </div>
        </nav>
    </MemorialPageShell>
  );
}
