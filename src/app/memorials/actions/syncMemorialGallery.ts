"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_GALLERY_IMAGES = 24;

/**
 * Replaces all gallery rows for a memorial with the given public image URLs (order preserved).
 */
export async function replaceMemorialGalleryRows(
  supabase: SupabaseClient,
  memorialId: string,
  imageUrls: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const urls = imageUrls
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, MAX_GALLERY_IMAGES);

  const { error: delErr } = await supabase
    .from("memorial_media")
    .delete()
    .eq("memorial_id", memorialId);

  if (delErr) {
    return { ok: false, error: `Failed to clear gallery: ${delErr.message}` };
  }

  if (urls.length === 0) {
    return { ok: true };
  }

  const rows = urls.map((image_url, sort_order) => ({
    memorial_id: memorialId,
    url: image_url,
    position: sort_order,
    type: "image",
    thumbnail_url: null
  }));

  const { error: insErr } = await supabase.from("memorial_media").insert(rows);

  if (insErr) {
    return {
      ok: false,
      error: `Failed to save gallery images: ${insErr.message}`
    };
  }

  return { ok: true };
}
