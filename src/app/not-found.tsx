import Link from "next/link";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <MemorialPageShell
      title="Page not found"
      subtitle="The page you are looking for may have been moved, removed, or never existed."
      maxWidth="3xl"
      contentClassName="mt-8"
    >
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-8 text-center shadow-md shadow-slate-400/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Error 404
        </p>
        <h2 className="mt-3 font-serif text-2xl font-semibold text-slate-900">
          We could not find that page
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
          You can return to the home page, browse memorial directories, or create a new memorial.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button variant="accent" className="px-5 py-2.5 text-sm">
              Go home
            </Button>
          </Link>
          <Link href="/memorials">
            <Button variant="secondary" className="px-5 py-2.5 text-sm">
              Browse memorials
            </Button>
          </Link>
        </div>
      </div>
    </MemorialPageShell>
  );
}
