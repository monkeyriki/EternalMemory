import { getSupabaseServerClient } from "@/lib/supabaseServer";
import MemorialCard from "@/components/memorial/MemorialCard";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MemorialsHumansPage({
  searchParams
}: {
  searchParams?: { page?: string };
}) {
  const pageSize = 10;
  const pageRaw = searchParams?.page ?? "1";
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const from = (page - 1) * pageSize;

  const supabase = await getSupabaseServerClient();
  const { data: memorials } = await supabase
    .from("memorials")
    .select("id, slug, type, full_name, date_of_birth, date_of_death, city")
    .eq("type", "human")
    .eq("visibility", "public")
    .eq("is_draft", false)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (!memorials) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Human memorials</h1>
      <p className="mt-2 text-slate-600">Browse public, published memorials.</p>

      {memorials.length === 0 ? (
        <p className="mt-8 text-slate-600">No memorials found yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memorials.map((m) => (
            <MemorialCard
              key={m.id}
              name={m.full_name}
              type={m.type}
              dateOfBirth={m.date_of_birth}
              dateOfDeath={m.date_of_death}
              city={m.city}
              slug={m.slug}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <div>
          {page > 1 ? (
            <Link
              href={`/memorials/humans?page=${page - 1}`}
              className="text-sm text-slate-700 hover:underline"
            >
              Previous
            </Link>
          ) : (
            <span className="text-sm text-slate-400">Previous</span>
          )}
        </div>
        <div>
          {memorials.length === pageSize ? (
            <Link
              href={`/memorials/humans?page=${page + 1}`}
              className="text-sm text-slate-700 hover:underline"
            >
              Next
            </Link>
          ) : (
            <span className="text-sm text-slate-400">Next</span>
          )}
        </div>
      </div>
    </div>
  );
}
