import { getSupabaseServerClient } from "@/lib/supabaseServer";
import IpBansAdminClient from "./IpBansAdminClient";

export default async function AdminIpBansPage() {
  const supabase = await getSupabaseServerClient();

  const { data: rows, error } = await supabase
    .from("ip_bans")
    .select("id, cidr, reason, created_at, expires_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[AdminIpBansPage]", error);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        IP bans
      </h1>
      <p className="text-sm text-slate-600">
        Block IPv4/IPv6 addresses or CIDR ranges site-wide (middleware + key APIs).{" "}
        <strong>Logged-in admins</strong> are never blocked by IP bans. For recovery without an
        admin session, set <code className="rounded bg-slate-100 px-1">IP_BAN_EXEMPT_IPS</code> in
        env (comma-separated) or remove the row in Supabase SQL.
      </p>

      <div>
        <IpBansAdminClient initialBans={rows ?? []} />
      </div>
    </div>
  );
}
