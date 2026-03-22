"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { upsertSettingAction } from "@/app/admin/settings/actions";

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

export async function updateAdSlotAction(input: {
  id: string;
  adsense_code: string;
  is_active: boolean;
  description: string | null;
}) {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const { error } = await guard.supabase
    .from("ad_slots")
    .update({
      adsense_code: input.adsense_code.trim() || null,
      is_active: input.is_active,
      description: input.description?.trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.id);

  if (error) return { ok: false as const, error: "Failed to update ad slot" };
  return { ok: true as const };
}

export async function createAdSlotAction(input: {
  slot_key: string;
  description?: string;
}) {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const key = input.slot_key.trim().toLowerCase().replace(/\s+/g, "_");
  if (!key || !/^[a-z0-9_-]+$/.test(key)) {
    return { ok: false as const, error: "Invalid slot key (use letters, numbers, dashes, underscores)." };
  }

  const { error } = await guard.supabase.from("ad_slots").insert({
    slot_key: key,
    description: input.description?.trim() || null,
    is_active: true,
    adsense_code: null
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false as const, error: "That slot key already exists." };
    }
    return { ok: false as const, error: "Failed to create slot" };
  }
  return { ok: true as const };
}

export async function setAdsEnabledAction(enabled: boolean) {
  return upsertSettingAction("ads_enabled", enabled ? "true" : "false");
}
