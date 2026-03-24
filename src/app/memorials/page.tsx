import Link from "next/link";
import { User, PawPrint } from "lucide-react";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";

export default function MemorialsIndexPage() {
  return (
    <MemorialPageShell
      title="Memorials"
      subtitle="Choose a category to explore public memorials, or create a new one to honor someone you love."
      maxWidth="3xl"
    >
      <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
        <Link
          href="/memorials/humans"
          className="group flex flex-1 items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-6 py-8 text-center shadow-md shadow-slate-400/10 backdrop-blur transition hover:border-amber-300/80 hover:shadow-lg hover:shadow-amber-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          <User className="h-8 w-8 shrink-0 text-amber-700 transition group-hover:scale-105" strokeWidth={1.5} />
          <div className="text-left">
            <span className="font-serif text-xl font-semibold text-slate-900">Human memorials</span>
            <p className="mt-1 text-sm text-slate-600">Browse tributes for people</p>
          </div>
        </Link>
        <Link
          href="/memorials/pets"
          className="group flex flex-1 items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-6 py-8 text-center shadow-md shadow-slate-400/10 backdrop-blur transition hover:border-amber-300/80 hover:shadow-lg hover:shadow-amber-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          <PawPrint className="h-8 w-8 shrink-0 text-amber-700 transition group-hover:scale-105" strokeWidth={1.5} />
          <div className="text-left">
            <span className="font-serif text-xl font-semibold text-slate-900">Pet memorials</span>
            <p className="mt-1 text-sm text-slate-600">Celebrate beloved companions</p>
          </div>
        </Link>
      </div>
      <p className="mt-8 text-center text-sm text-slate-500">
        Want to add a memorial?{" "}
        <Link
          href="/memorials/new"
          className="rounded-md font-medium text-amber-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          Create one
        </Link>
      </p>
    </MemorialPageShell>
  );
}
