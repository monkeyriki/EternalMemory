export default function AdminAccountDeletionRequestsLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy>
      <div>
        <div className="h-9 w-72 rounded-2xl bg-slate-200" />
        <div className="mt-3 h-4 w-[36rem] max-w-full rounded-xl bg-slate-200" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm"
          >
            <div className="h-4 w-32 rounded-full bg-slate-100" />
            <div className="mt-3 h-3 w-64 rounded-full bg-slate-100" />
            <div className="mt-2 h-3 w-48 rounded-full bg-slate-100" />
            <div className="mt-4 h-10 rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
