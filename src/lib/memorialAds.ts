import type { SupabaseClient } from "@supabase/supabase-js";
import { memorialEligibleForPlatformAds } from "@/lib/memorialHostingPlan";

export type MemorialAdsForClient =
  | { show: false }
  | { show: true; topHtml: string | null; bottomHtml: string | null };

type MemorialAdsRow = {
  ads_free?: boolean | null;
  hosting_plan?: string | null;
  plan_expires_at?: string | null;
};

/**
 * Loads global ads toggle + active slots.
 * Basic plan: may show platform ads (unless ads_free). Premium/Lifetime: no platform ads.
 */
export async function buildMemorialAdsPayload(
  supabase: SupabaseClient,
  memorial: MemorialAdsRow
): Promise<MemorialAdsForClient> {
  if (!memorialEligibleForPlatformAds(memorial)) {
    return { show: false };
  }

  const { data: setting } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "ads_enabled")
    .maybeSingle();

  const enabled = String(setting?.value ?? "")
    .trim()
    .toLowerCase();
  if (enabled !== "true" && enabled !== "1" && enabled !== "yes") {
    return { show: false };
  }

  const { data: slots } = await supabase
    .from("ad_slots")
    .select("slot_key, adsense_code")
    .eq("is_active", true);

  const map = new Map<string, string>();
  for (const row of slots ?? []) {
    const key = row.slot_key as string;
    const code = (row.adsense_code as string | null)?.trim() ?? "";
    if (code) map.set(key, code);
  }

  const top = map.get("memorial_top") ?? "";
  const bottom = map.get("memorial_bottom") ?? "";
  if (!top && !bottom) {
    return { show: false };
  }

  return {
    show: true,
    topHtml: top || null,
    bottomHtml: bottom || null
  };
}
