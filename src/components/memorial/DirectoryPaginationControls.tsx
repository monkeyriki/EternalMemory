"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type DirectoryPaginationControlsProps = {
  prevHref: string | null;
  nextHref: string | null;
  currentPage: number;
  totalPages: number;
};

export function DirectoryPaginationControls({
  prevHref,
  nextHref,
  currentPage,
  totalPages
}: DirectoryPaginationControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const goTo = (href: string | null) => {
    if (!href || isPending) return;
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav
      className="mt-10 border-t border-slate-200/80 pt-8"
      aria-label="Pagination"
      aria-busy={isPending}
    >
      {isPending && (
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-amber-600/90" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          {prevHref ? (
            <button
              type="button"
              onClick={() => goTo(prevHref)}
              disabled={isPending}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isPending ? "Loading..." : "Previous"}
            </button>
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
          {nextHref ? (
            <button
              type="button"
              onClick={() => goTo(nextHref)}
              disabled={isPending}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isPending ? "Loading..." : "Next"}
            </button>
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
      </div>
    </nav>
  );
}
