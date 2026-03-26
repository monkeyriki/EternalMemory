import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { UsersAdminClient, type ProfileRow } from "./UsersAdminClient";

export default async function AdminUsersPage() {
  const supabase = await getSupabaseServerClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
          Users
        </h1>
        <p className="mt-2 text-red-600">Failed to load profiles.</p>
      </div>
    );
  }

  const admin = getSupabaseAdminClient();
  const { data: authUsers, error: authErr } = await admin.auth.admin.listUsers({
    perPage: 200,
    page: 1
  });
  if (authErr) {
    console.error("AdminUsersPage listUsers:", authErr);
  }
  const emailById = new Map<string, string>();
  for (const u of authUsers?.users ?? []) {
    if (u?.id && u?.email) emailById.set(u.id, u.email);
  }

  const rows: ProfileRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    display_name: p.display_name,
    email: emailById.get(p.id) ?? null,
    role: p.role,
    created_at: p.created_at
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Users
      </h1>
      <div>
        <UsersAdminClient profiles={rows} />
      </div>
    </div>
  );
}
