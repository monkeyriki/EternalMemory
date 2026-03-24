export default function AdminStoreLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy>
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-44 rounded-2xl bg-slate-200" />
          <div className="mt-3 h-4 w-[30rem] max-w-full rounded-xl bg-slate-200" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-slate-200" />
      </div>
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
