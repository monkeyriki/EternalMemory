"use server";

import { requireAdmin } from "@/lib/requireAdmin";

export type MemorialAdminActionResult =
  | { ok: true }
  | { ok: false; error: string };

/** Super-admin: permanently delete a memorial and dependent rows (DB cascades). */
export async function deleteMemorialAsAdminAction(
  memorialId: string
): Promise<MemorialAdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const id = memorialId?.trim();
  if (!id) return { ok: false, error: "Invalid memorial." };

  const { error } = await guard.supabase.from("memorials").delete().eq("id", id);

  if (error) {
    console.error("[deleteMemorialAsAdminAction]", error);
    return { ok: false, error: "Could not remove memorial." };
  }
  return { ok: true };
}
