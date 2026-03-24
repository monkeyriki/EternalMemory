"use server";

import { requireAdmin } from "@/lib/requireAdmin";

const ALLOWED_STATUS = new Set([
  "pending",
  "in_review",
  "completed",
  "rejected"
]);

export type AccountDeletionAdminActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateAccountDeletionRequestAction(input: {
  id: string;
  status: string;
  adminNote?: string;
}): Promise<AccountDeletionAdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const id = input.id?.trim();
  const status = input.status?.trim();
  if (!id) return { ok: false, error: "Invalid request id." };
  if (!ALLOWED_STATUS.has(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const adminNote = (input.adminNote ?? "").trim().slice(0, 2000);
  const now = new Date().toISOString();

  const { error } = await (guard.supabase as any)
    .from("account_deletion_requests")
    .update({
      status,
      admin_note: adminNote || null,
      processed_at: status === "pending" || status === "in_review" ? null : now
    })
    .eq("id", id);

  if (error) {
    console.error("[updateAccountDeletionRequestAction]", error);
    return { ok: false, error: "Could not update deletion request." };
  }

  return { ok: true };
}
