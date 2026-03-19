"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type DirectoryFiltersProps = {
  currentSearch?: string;
  currentCity?: string;
  currentSort?: string;
};

const DEBOUNCE_MS = 400;

export default function DirectoryFilters({
  currentSearch = "",
  currentCity = "",
  currentSort = "recent"
}: DirectoryFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [city, setCity] = useState(currentCity);
  const [sort, setSort] = useState(currentSort ?? "recent");

  useEffect(() => {
    setSearch(currentSearch);
    setCity(currentCity);
    setSort(currentSort ?? "recent");
  }, [currentSearch, currentCity, currentSort]);

  // Debounce URL update for text inputs; sort updates immediately via handleSortChange
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (city.trim()) params.set("city", city.trim());
      if (sort && sort !== "recent") params.set("sort", sort);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search, city, sort, pathname, router]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSort(value);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (city.trim()) params.set("city", city.trim());
    if (value && value !== "recent") params.set("sort", value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const hasActiveFilters =
    (search && search.trim()) ||
    (city && city.trim()) ||
    (sort && sort !== "recent");

  const handleReset = () => {
    setSearch("");
    setCity("");
    setSort("recent");
    router.replace(pathname);
  };

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
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
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label htmlFor="dir-sort" className="text-sm text-slate-600">
          Sort
        </label>
        <select
          id="dir-sort"
          value={sort}
          onChange={handleSortChange}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
        >
          <option value="recent">Recently added</option>
          <option value="updated">Recently updated</option>
          <option value="alpha">Alphabetical (A–Z)</option>
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-slate-500 underline hover:text-slate-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
