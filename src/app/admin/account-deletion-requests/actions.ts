"use server";

import { requireAdmin } from "@/lib/requireAdmin";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

const ALLOWED_STATUS = new Set([
  "pending",
  "in_review",
  "completed",
  "rejected"
]);

export type AccountDeletionAdminActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function forceDeleteUserAccount(userId: string): Promise<AccountDeletionAdminActionResult> {
  const admin = getSupabaseAdminClient();

  const { data: existingUser, error: existingErr } = await admin.auth.admin.getUserById(
    userId
  );
  if (existingErr && !String(existingErr.message ?? "").toLowerCase().includes("not found")) {
    console.error("[forceDeleteUserAccount] getUserById failed", existingErr);
    return { ok: false, error: "Could not verify target user before deletion." };
  }
  if (!existingUser?.user) {
    // Already deleted: treat as success for idempotency.
    return { ok: true };
  }

  let { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
  if (!deleteErr) return { ok: true };

  // FK cleanup retry path for environments where references block auth.users deletion.
  console.warn("[forceDeleteUserAccount] first deleteUser failed, trying cleanup", deleteErr);

  await (admin as any).from("orders").update({ user_id: null }).eq("user_id", userId);
  await (admin as any)
    .from("guestbook_entries")
    .update({ author_id: null })
    .eq("author_id", userId);
  await (admin as any)
    .from("virtual_tributes")
    .update({ purchaser_id: null })
    .eq("purchaser_id", userId);
  await (admin as any)
    .from("memorials")
    .update({ managed_by_partner_id: null })
    .eq("managed_by_partner_id", userId);

  await (admin as any).from("b2b_subscriptions").delete().eq("account_id", userId);
  await (admin as any).from("memorials").delete().eq("owner_id", userId);

  ({ error: deleteErr } = await admin.auth.admin.deleteUser(userId));
  if (deleteErr) {
    console.error("[forceDeleteUserAccount] deleteUser failed after cleanup", deleteErr);
    return {
      ok: false,
      error:
        "Could not delete the user account after cleanup. Check Supabase logs for FK constraints."
    };
  }

  return { ok: true };
}

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
  const requestedCompletion = status === "completed";

  if (requestedCompletion) {
    const { data: reqRow, error: reqErr } = await (guard.supabase as any)
      .from("account_deletion_requests")
      .select("user_id, status")
      .eq("id", id)
      .maybeSingle();

    if (reqErr || !reqRow?.user_id) {
      console.error("[updateAccountDeletionRequestAction] load request failed", reqErr);
      return {
        ok: false,
        error: "Could not load deletion request user."
      };
    }

    // Always enforce deletion on completed, including old requests already marked completed.
    const deletionResult = await forceDeleteUserAccount(reqRow.user_id);
    if (!deletionResult.ok) {
      return {
        ok: false,
        error: `${deletionResult.error} Request was not marked as completed.`
      };
    }
  }

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
