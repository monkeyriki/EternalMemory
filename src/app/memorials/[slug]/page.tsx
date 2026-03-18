import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

function formatDate(date: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US");
}

function formatVisibility(value: string): string {
  switch (value) {
    case "public":
      return "Public";
    case "unlisted":
      return "Unlisted";
    case "password_protected":
      return "Password protected";
    default:
      return value;
  }
}

function formatType(value: string): string {
  switch (value) {
    case "human":
      return "Human";
    case "pet":
      return "Pet";
    default:
      return value;
  }
}

export default async function MemorialSlugPage({
  params
}: {
  params: { slug: string };
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  const slug = params.slug.toLowerCase();

  const { data: memorial } = await supabase
    .from("memorials")
    .select(
      "id, owner_id, type, full_name, date_of_birth, date_of_death, city, visibility, is_draft"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!memorial) return notFound();

  const isOwner = !!user && memorial.owner_id === user.id;
  const isAdmin = role === "admin";

  // Draft memorials must not be visible to public visitors.
  if (memorial.is_draft && !isOwner && !isAdmin) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          {memorial.full_name}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {formatType(memorial.type)} memorial
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Dates
            </p>
            <p className="mt-1 text-sm text-slate-800">
              Born: {formatDate(memorial.date_of_birth)} <br />
              Died: {formatDate(memorial.date_of_death)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Location
            </p>
            <p className="mt-1 text-sm text-slate-800">
              {memorial.city ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Visibility
            </p>
            <p className="mt-1 text-sm text-slate-800">
              {formatVisibility(memorial.visibility)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="mt-1 text-sm text-slate-800">
              {memorial.is_draft ? "Draft" : "Published"}
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Memorial page content is being built. (Basic placeholder)
        </p>
      </div>
    </div>
  );
}
