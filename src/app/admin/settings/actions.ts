"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, error: "Not authenticated", supabase };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Not authorized", supabase };
  }

  return { ok: true as const, supabase };
}

export async function upsertSettingAction(key: string, value: string) {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const { error } = await guard.supabase
    .from("platform_settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) return { ok: false as const, error: "Failed to save setting" };
  return { ok: true as const };
}

export async function deleteSettingAction(id: string) {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const { error } = await guard.supabase
    .from("platform_settings")
    .delete()
    .eq("id", id);

  if (error) return { ok: false as const, error: "Failed to delete setting" };
  return { ok: true as const };
}

