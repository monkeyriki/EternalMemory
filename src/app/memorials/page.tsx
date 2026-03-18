import Link from "next/link";

export default function MemorialsIndexPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Memorials</h1>
      <p className="text-slate-600">Choose a category to explore memorials.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/memorials/humans"
          className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Human memorials
        </Link>
        <Link
          href="/memorials/pets"
          className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Pet memorials
        </Link>
      </div>
    </div>
  );
}
