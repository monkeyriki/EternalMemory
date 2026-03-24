export default function DashboardLoading() {
  return (
    <div className="relative min-h-[60vh] overflow-hidden px-4 py-10 sm:py-14" aria-busy>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-100/40 via-sky-50/15 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-5xl animate-pulse">
        <div className="mx-auto h-10 w-64 rounded-2xl bg-slate-200" />
        <div className="mx-auto mt-3 h-4 w-96 max-w-full rounded-xl bg-slate-200" />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
              <div className="h-4 w-24 rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-20 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm">
          <div className="h-6 w-40 rounded-xl bg-slate-200" />
          <div className="mt-3 h-3 w-24 rounded-full bg-slate-200" />
          <div className="mt-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl border border-slate-200/80 bg-slate-50/80" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
