import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Comma-separated IPs that always bypass IP ban checks (middleware + server actions).
 * Use your home/office IP if you need access before logging in as admin.
 * Example: IP_BAN_EXEMPT_IPS=203.0.113.50,198.51.100.2
 */
export function getIpBanExemptIpsFromEnv(): string[] {
  return (
    process.env.IP_BAN_EXEMPT_IPS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? []
  );
}

export function isIpExemptByEnv(clientIp: string): boolean {
  if (!clientIp) return true;
  return getIpBanExemptIpsFromEnv().includes(clientIp);
}

/**
 * Skip ban RPC when IP is in env allowlist, or current user is platform admin.
 */
export async function shouldSkipIpBanForRequest(
  supabase: SupabaseClient<Database>,
  clientIp: string,
  user: User | null
): Promise<boolean> {
  if (!clientIp) return true;
  if (isIpExemptByEnv(clientIp)) return true;
  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "admin") return true;
  }
  return false;
}
