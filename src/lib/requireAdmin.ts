import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type AdminGuardResult =
  | { ok: true; user: { id: string }; supabase: SupabaseClient<Database> }
  | { ok: false; error: string; user: null; supabase: SupabaseClient<Database> };

/**
 * Ensures the current session is an authenticated platform admin (`profiles.role = admin`).
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated", user: null, supabase };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Not authorized", user: null, supabase };
  }

  return { ok: true, user: { id: user.id }, supabase };
}
