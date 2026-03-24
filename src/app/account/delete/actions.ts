"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { sendTransactionalEmail } from "@/lib/resendEmail";

type RequestDeletionResult = { ok: true } | { ok: false; error: string };

export async function requestAccountDeletionAction(
  reason: string
): Promise<RequestDeletionResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const cleanReason = reason.trim().slice(0, 1200);

  const { error } = await supabase.from("account_deletion_requests").insert({
    user_id: user.id,
    email: user.email ?? null,
    reason: cleanReason || null
  });

  if (error) {
    if (
      error.message.toLowerCase().includes("relation") &&
      error.message.toLowerCase().includes("account_deletion_requests")
    ) {
      return {
        ok: false,
        error:
          "Deletion requests table is not configured yet. Apply the latest Supabase migration first."
      };
    }
    return { ok: false, error: "Failed to submit deletion request." };
  }

  // Optional ops notification; non-blocking if email provider missing.
  await sendTransactionalEmail({
    to: "privacy@eternalmemory.example",
    subject: "New account deletion request",
    html: `
      <p>A user requested account deletion.</p>
      <p><strong>User ID:</strong> ${user.id}</p>
      <p><strong>Email:</strong> ${user.email ?? "(unknown)"}</p>
      <p><strong>Reason:</strong> ${cleanReason || "(not provided)"}</p>
    `,
    text: `A user requested account deletion.
User ID: ${user.id}
Email: ${user.email ?? "(unknown)"}
Reason: ${cleanReason || "(not provided)"}`
  });

  return { ok: true };
}
