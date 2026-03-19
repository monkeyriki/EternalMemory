"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not authenticated." };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Admin only." };
  }
  return { ok: true as const, user, supabase };
}

export async function approveTributeAction(id: string): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const result = await requireAdmin();
  if (!result.ok) return { ok: false, error: result.error };
  const { supabase } = result;

  const { error } = await supabase
    .from("virtual_tributes")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Failed to approve tribute." };
  }
  return { ok: true };
}
