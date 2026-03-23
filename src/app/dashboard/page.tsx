import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import { Button } from "@/components/Button";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    // Adjust this path if your login route differs.
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: memorials } = await supabase
    .from("memorials")
    .select("id, slug, type, full_name, visibility, is_draft, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const hasMemorials = Array.isArray(memorials) && memorials.length > 0;
  const showB2BBanner = profile?.role !== "b2b";

  return (
    <MemorialPageShell
      title="My memorials"
      subtitle="Create, edit, and share the memorials you manage."
      maxWidth="5xl"
      contentClassName="mt-6 space-y-6"
    >
        {showB2BBanner && (
          <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 px-5 py-4 shadow-sm backdrop-blur">
            <p className="text-sm font-medium text-amber-950">
              Are you a funeral home or pet crematorium? Join our B2B program.
            </p>
            <p className="mt-1 text-xs text-amber-900/80">
              Bulk memorials for your clients with a monthly subscription.
            </p>
            <Link
              href="/dashboard/b2b"
              className="mt-3 inline-flex text-sm font-semibold text-amber-800 underline-offset-2 hover:underline"
            >
              Open B2B dashboard →
            </Link>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            Your memorials appear below. Need another page?{" "}
            <Link href="/memorials" className="font-medium text-amber-800 underline-offset-4 hover:underline">
              Browse directory
            </Link>
          </p>
          <Link href="/memorials/new">
            <Button variant="accent" className="px-5 py-2 text-xs font-semibold uppercase tracking-wide">
              + Create memorial
            </Button>
          </Link>
        </div>

        {!hasMemorials ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-10 text-center shadow-md shadow-slate-400/10 backdrop-blur">
            <div className="mb-3 text-3xl">🕯️</div>
            <h2 className="font-serif text-xl font-semibold text-slate-900">
              No memorials yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create your first memorial to get started.
            </p>
            <div className="mt-4">
              <Link href="/memorials/new">
                <Button variant="accent" className="px-6 py-2.5 text-sm">
                  Create a memorial
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {memorials!.map((m) => {
              const typeLabel =
                m.type === "human" ? "Human" : m.type === "pet" ? "Pet" : m.type;
              const statusLabel = m.is_draft ? "Draft" : "Published";
              const visibilityLabel =
                m.visibility === "public"
                  ? "Public"
                  : m.visibility === "unlisted"
                  ? "Unlisted"
                  : m.visibility === "password_protected"
                  ? "Protected"
                  : m.visibility;

              const statusClasses = m.is_draft
                ? "bg-slate-100 text-slate-500"
                : "bg-green-100 text-green-700";

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-6 py-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-slate-900">
                      {m.full_name}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
                        {typeLabel}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${statusClasses}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
                        {visibilityLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm">
                    <Link
                      href={`/memorials/${m.slug}`}
                      className="text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/memorials/${m.slug}/edit`}
                      className="text-amber-600 underline-offset-2 hover:text-amber-700 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </MemorialPageShell>
  );
}
