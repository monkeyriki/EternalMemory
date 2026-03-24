import { normalizeTagToken } from "@/lib/memorialTags";

export type MemorialDirectorySearchParams = {
  search?: string;
  city?: string;
  state?: string;
  sort?: string;
  page?: string;
  birth_year_min?: string;
  birth_year_max?: string;
  death_year_min?: string;
  death_year_max?: string;
  /** Comma-separated in URL, e.g. veteran,golden-retriever */
  tags?: string;
};

export function parseYearFilter(
  value: string | undefined
): number | null {
  if (!value?.trim()) return null;
  const n = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(n) || n < 1000 || n > 2100) return null;
  return n;
}

/** Tags from URL for overlaps filter (OR: memorial has any of these). */
export function parseTagsFilterParam(tagsParam: string | undefined): string[] {
  if (!tagsParam?.trim()) return [];
  const parts = tagsParam.split(/[\n,]+/);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    const n = normalizeTagToken(p);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
    if (out.length >= 15) break;
  }
  return out;
}

export function buildMemorialDirectoryQueryString(
  params: MemorialDirectorySearchParams,
  page?: number
): string {
  const q = new URLSearchParams();
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.city?.trim()) q.set("city", params.city.trim());
  if (params.state?.trim()) q.set("state", params.state.trim());
  if (params.sort && params.sort !== "recent") q.set("sort", params.sort);
  if (params.birth_year_min?.trim())
    q.set("birth_year_min", params.birth_year_min.trim());
  if (params.birth_year_max?.trim())
    q.set("birth_year_max", params.birth_year_max.trim());
  if (params.death_year_min?.trim())
    q.set("death_year_min", params.death_year_min.trim());
  if (params.death_year_max?.trim())
    q.set("death_year_max", params.death_year_max.trim());
  if (params.tags?.trim()) q.set("tags", params.tags.trim());
  if (page != null && page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function directoryHasAdvancedFilters(
  params: MemorialDirectorySearchParams | undefined
): boolean {
  if (!params) return false;
  return !!(
    params.state?.trim() ||
    params.birth_year_min?.trim() ||
    params.birth_year_max?.trim() ||
    params.death_year_min?.trim() ||
    params.death_year_max?.trim() ||
    params.tags?.trim()
  );
}
