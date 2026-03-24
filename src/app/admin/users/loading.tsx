export default function AdminUsersLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy>
      <div>
        <div className="h-9 w-40 rounded-2xl bg-slate-200" />
        <div className="mt-3 h-4 w-[34rem] max-w-full rounded-xl bg-slate-200" />
      </div>
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
        <div className="h-10 w-full rounded-xl bg-slate-100" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
