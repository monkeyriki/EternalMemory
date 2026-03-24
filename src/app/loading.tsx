import Link from "next/link";

export default function GlobalLoading() {
  return (
    <div className="relative min-h-[60vh] overflow-hidden px-4 py-10 sm:py-14" aria-busy>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-100/40 via-sky-50/15 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-5xl animate-pulse">
        <div className="mx-auto h-3 w-40 rounded-full bg-slate-200" />
        <div className="mx-auto mt-4 h-10 w-72 rounded-2xl bg-slate-200" />
        <div className="mx-auto mt-3 h-5 w-[26rem] max-w-full rounded-xl bg-slate-200" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm"
            >
              <div className="h-4 w-1/3 rounded-full bg-slate-200" />
              <div className="mt-4 h-3 w-full rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-200" />
              <div className="mt-6 h-9 w-28 rounded-xl bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-slate-500">
          Loading page content...
        </div>
      </div>
    </div>
  );
}
