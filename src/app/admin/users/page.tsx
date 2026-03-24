import { getSupabaseServerClient } from "@/lib/supabaseServer";
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

  const rows: ProfileRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    display_name: p.display_name,
    role: p.role,
    created_at: p.created_at
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Users
      </h1>
      <p className="text-sm text-slate-600">
        Promote accounts to B2B for testing. Creates an active{" "}
        <code className="rounded bg-slate-100 px-1">b2b_subscriptions</code> row
        with <code className="rounded bg-slate-100 px-1">admin_grant:&lt;id&gt;</code>
        .
      </p>
      <div>
        <UsersAdminClient profiles={rows} />
      </div>
    </div>
  );
}
