/** Bucket id for admin-uploaded virtual tribute assets (must match Supabase Storage). */
export const STORE_ITEMS_BUCKET = "store-items";

/**
 * Extract Storage object path from a public URL for this bucket, or null if not our bucket.
 */
export function publicUrlToStoreItemPath(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const marker = `/object/public/${STORE_ITEMS_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  let path = url.slice(i + marker.length);
  const q = path.indexOf("?");
  if (q !== -1) path = path.slice(0, q);
  try {
    path = decodeURIComponent(path);
  } catch {
    /* keep raw */
  }
  return path || null;
}
