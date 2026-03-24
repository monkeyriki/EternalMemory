"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import { Button } from "@/components/Button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <MemorialPageShell
      title="Something went wrong"
      subtitle="An unexpected error occurred while loading this page."
      maxWidth="3xl"
      contentClassName="mt-8"
    >
      <div className="rounded-2xl border border-red-200/90 bg-white/95 p-8 text-center shadow-md shadow-slate-400/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
          Error 500
        </p>
        <h2 className="mt-3 font-serif text-2xl font-semibold text-slate-900">
          We hit an unexpected issue
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
          Please try again. If the problem continues, contact support and include what you were doing.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset}>
            <Button variant="accent" className="px-5 py-2.5 text-sm">
              Try again
            </Button>
          </button>
          <Link href="/contact">
            <Button variant="secondary" className="px-5 py-2.5 text-sm">
              Contact support
            </Button>
          </Link>
        </div>
      </div>
    </MemorialPageShell>
  );
}
