export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8" aria-busy>
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[240px_1fr]">
        <aside className="animate-pulse rounded-2xl bg-slate-900 p-3 shadow-sm">
          <div className="px-3 py-2">
            <div className="h-3 w-20 rounded-full bg-slate-700" />
            <div className="mt-2 h-5 w-28 rounded-full bg-slate-700" />
          </div>
          <div className="space-y-2 p-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 rounded-lg bg-slate-800" />
            ))}
          </div>
        </aside>

        <div className="animate-pulse space-y-6">
          <div>
            <div className="h-10 w-56 rounded-2xl bg-slate-200" />
            <div className="mt-3 h-4 w-80 max-w-full rounded-xl bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
                <div className="h-8 w-14 rounded-xl bg-slate-200" />
                <div className="mt-2 h-3 w-24 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
