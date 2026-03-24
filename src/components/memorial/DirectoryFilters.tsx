"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type DirectoryFiltersProps = {
  currentSearch?: string;
  currentCity?: string;
  currentState?: string;
  currentSort?: string;
  currentBirthYearMin?: string;
  currentBirthYearMax?: string;
  currentDeathYearMin?: string;
  currentDeathYearMax?: string;
  currentTags?: string;
};

const DEBOUNCE_MS = 450;

export default function DirectoryFilters({
  currentSearch = "",
  currentCity = "",
  currentState = "",
  currentSort = "recent",
  currentBirthYearMin = "",
  currentBirthYearMax = "",
  currentDeathYearMin = "",
  currentDeathYearMax = "",
  currentTags = ""
}: DirectoryFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [city, setCity] = useState(currentCity);
  const [state, setState] = useState(currentState);
  const [sort, setSort] = useState(currentSort ?? "recent");
  const [birthYearMin, setBirthYearMin] = useState(currentBirthYearMin);
  const [birthYearMax, setBirthYearMax] = useState(currentBirthYearMax);
  const [deathYearMin, setDeathYearMin] = useState(currentDeathYearMin);
  const [deathYearMax, setDeathYearMax] = useState(currentDeathYearMax);
  const [tags, setTags] = useState(currentTags);

  useEffect(() => {
    setSearch(currentSearch);
    setCity(currentCity);
    setState(currentState);
    setSort(currentSort ?? "recent");
    setBirthYearMin(currentBirthYearMin);
    setBirthYearMax(currentBirthYearMax);
    setDeathYearMin(currentDeathYearMin);
    setDeathYearMax(currentDeathYearMax);
    setTags(currentTags);
  }, [
    currentSearch,
    currentCity,
    currentState,
    currentSort,
    currentBirthYearMin,
    currentBirthYearMax,
    currentDeathYearMin,
    currentDeathYearMax,
    currentTags
  ]);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (city.trim()) params.set("city", city.trim());
      if (state.trim()) params.set("state", state.trim());
      if (sort && sort !== "recent") params.set("sort", sort);
      if (birthYearMin.trim())
        params.set("birth_year_min", birthYearMin.trim());
      if (birthYearMax.trim())
        params.set("birth_year_max", birthYearMax.trim());
      if (deathYearMin.trim())
        params.set("death_year_min", deathYearMin.trim());
      if (deathYearMax.trim())
        params.set("death_year_max", deathYearMax.trim());
      if (tags.trim()) params.set("tags", tags.trim());
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [
    search,
    city,
    state,
    sort,
    birthYearMin,
    birthYearMax,
    deathYearMin,
    deathYearMax,
    tags,
    pathname,
    router
  ]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSort(value);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (city.trim()) params.set("city", city.trim());
    if (state.trim()) params.set("state", state.trim());
    if (value && value !== "recent") params.set("sort", value);
    if (birthYearMin.trim()) params.set("birth_year_min", birthYearMin.trim());
    if (birthYearMax.trim()) params.set("birth_year_max", birthYearMax.trim());
    if (deathYearMin.trim()) params.set("death_year_min", deathYearMin.trim());
    if (deathYearMax.trim()) params.set("death_year_max", deathYearMax.trim());
    if (tags.trim()) params.set("tags", tags.trim());
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const hasActiveFilters =
    (search && search.trim()) ||
    (city && city.trim()) ||
    (state && state.trim()) ||
    (sort && sort !== "recent") ||
    birthYearMin.trim() ||
    birthYearMax.trim() ||
    deathYearMin.trim() ||
    deathYearMax.trim() ||
    tags.trim();

  const handleReset = () => {
    setSearch("");
    setCity("");
    setState("");
    setSort("recent");
    setBirthYearMin("");
    setBirthYearMax("");
    setDeathYearMin("");
    setDeathYearMax("");
    setTags("");
    router.replace(pathname);
  };

  return (
    <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-md shadow-slate-400/10 backdrop-blur">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        Search & filters
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="dir-search" className="sr-only">
            Search by name
          </label>
          <input
            id="dir-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div>
          <label htmlFor="dir-city" className="sr-only">
            Filter by city
          </label>
          <input
            id="dir-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Filter by city..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div>
          <label htmlFor="dir-state" className="sr-only">
            Filter by state
          </label>
          <input
            id="dir-state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Filter by state..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label
            htmlFor="dir-birth-min"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Birth year from
          </label>
          <input
            id="dir-birth-min"
            type="number"
            inputMode="numeric"
            min={1000}
            max={2100}
            placeholder="e.g. 1940"
            value={birthYearMin}
            onChange={(e) => setBirthYearMin(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div>
          <label
            htmlFor="dir-birth-max"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Birth year to
          </label>
          <input
            id="dir-birth-max"
            type="number"
            inputMode="numeric"
            min={1000}
            max={2100}
            placeholder="e.g. 1960"
            value={birthYearMax}
            onChange={(e) => setBirthYearMax(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div>
          <label
            htmlFor="dir-death-min"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Death year from
          </label>
          <input
            id="dir-death-min"
            type="number"
            inputMode="numeric"
            min={1000}
            max={2100}
            placeholder="e.g. 2020"
            value={deathYearMin}
            onChange={(e) => setDeathYearMin(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div>
          <label
            htmlFor="dir-death-max"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            Death year to
          </label>
          <input
            id="dir-death-max"
            type="number"
            inputMode="numeric"
            min={1000}
            max={2100}
            placeholder="e.g. 2024"
            value={deathYearMax}
            onChange={(e) => setDeathYearMax(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="dir-tags" className="mb-1 block text-xs font-medium text-slate-600">
          Tags (any match)
        </label>
        <input
          id="dir-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. veteran, golden-retriever, acme-funeral"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
        <p className="mt-1 text-xs text-slate-500">
          Comma-separated. Shows memorials that include at least one of these tags.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label htmlFor="dir-sort" className="text-sm text-slate-600">
          Sort
        </label>
        <select
          id="dir-sort"
          value={sort}
          onChange={handleSortChange}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        >
          <option value="recent">Recently added</option>
          <option value="updated">Recently updated</option>
          <option value="alpha">Alphabetical (A–Z)</option>
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-amber-800 underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
