import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    // Adjust this path if your login route differs.
    redirect("/auth/login");
  }

  const { data: memorials } = await supabase
    .from("memorials")
    .select("id, slug, type, full_name, visibility, is_draft, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const hasMemorials = Array.isArray(memorials) && memorials.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              My Memorials
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your memorials.
            </p>
          </div>
          <Link
            href="/memorials/new"
            className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
          >
            + Create memorial
          </Link>
        </div>

        {!hasMemorials ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mb-3 text-3xl">🕯️</div>
            <h2 className="text-lg font-semibold text-slate-900">
              No memorials yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create your first memorial to get started.
            </p>
            <div className="mt-4">
              <Link
                href="/memorials/new"
                className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
              >
                Create a memorial
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
      </div>
    </div>
  );
}
