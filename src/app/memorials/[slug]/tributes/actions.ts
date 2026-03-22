"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { sendTransactionalEmail } from "@/lib/resendEmail";
import { guestTributePendingOwnerEmail } from "@/lib/emailTemplates";
import { assertPasswordMemorialInteractionAllowed } from "@/lib/memorialPasswordAccess";
import {
  getActiveBlockedWordsEn,
  PROFANITY_BLOCKED_MESSAGE,
  textMatchesBlockedTerms
} from "@/lib/profanityEn";

type CreateTributeInput = {
  memorial_id: string;
  message: string;
  guest_name?: string;
};

type TributeActionResult = {
  ok: boolean;
  error?: string;
};

export async function createTributeAction(
  input: CreateTributeInput
): Promise<TributeActionResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const message = input.message.trim();
  if (!message) {
    return { ok: false, error: "Tribute message cannot be empty." };
  }
  if (message.length > 500) {
    return {
      ok: false,
      error: "Tribute message must be at most 500 characters."
    };
  }

  const guestName = input.guest_name?.trim();
  if (guestName && guestName.length > 50) {
    return {
      ok: false,
      error: "Guest name must be at most 50 characters."
    };
  }

  const access = await assertPasswordMemorialInteractionAllowed(
    input.memorial_id
  );
  if (!access.ok) {
    return { ok: false, error: access.error };
  }

  const blocked = await getActiveBlockedWordsEn(supabase);
  if (textMatchesBlockedTerms(message, blocked)) {
    return { ok: false, error: PROFANITY_BLOCKED_MESSAGE };
  }
  if (guestName && textMatchesBlockedTerms(guestName, blocked)) {
    return { ok: false, error: PROFANITY_BLOCKED_MESSAGE };
  }

  if (user) {
    const { error } = await supabase.from("virtual_tributes").insert({
      memorial_id: input.memorial_id,
      purchaser_id: user.id,
      message,
      order_id: null,
      store_item_id: null,
      guest_name: null,
      is_approved: true
    });
    if (error) {
      return { ok: false, error: "Failed to post tribute. Please try again." };
    }
    return { ok: true };
  }

  const { error } = await supabase.from("virtual_tributes").insert({
    memorial_id: input.memorial_id,
    purchaser_id: null,
    message,
    order_id: null,
    store_item_id: null,
    guest_name: guestName || "Anonymous",
    is_approved: false
  });
  if (error) {
    return { ok: false, error: "Failed to post tribute. Please try again." };
  }

  const displayGuestName = guestName || "Anonymous";
  try {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://eternalmemory.app";
    const { data: memorial } = await supabase
      .from("memorials")
      .select("owner_id, full_name, slug")
      .eq("id", input.memorial_id)
      .maybeSingle();

    if (memorial?.owner_id) {
      const admin = getSupabaseAdminClient();
      const { data: ownerAuth, error: ownerAuthErr } =
        await admin.auth.admin.getUserById(memorial.owner_id);
      if (ownerAuthErr) {
        console.error(
          "[createTributeAction] getUserById for owner failed:",
          ownerAuthErr
        );
      } else {
        const ownerUser = ownerAuth?.user;
        const ownerEmail = ownerUser?.email?.trim();
        if (ownerEmail) {
          const meta = ownerUser?.user_metadata as
            | { full_name?: string }
            | undefined;
          const ownerName =
            meta?.full_name?.trim() ||
            ownerUser?.email?.split("@")[0] ||
            "there";
          const memorialName = memorial.full_name?.trim() || "Memorial";
          const content = guestTributePendingOwnerEmail({
            ownerName,
            guestName: displayGuestName,
            memorialName,
            appUrl
          });
          const sendResult = await sendTransactionalEmail({
            to: ownerEmail,
            subject: content.subject,
            html: content.html,
            text: content.text
          });
          if (!sendResult.ok && !sendResult.skipped) {
            console.error(
              "[createTributeAction] owner moderation email failed:",
              sendResult.error
            );
          }
        }
      }
    }
  } catch (emailErr) {
    console.error(
      "[createTributeAction] guest tribute owner notification error:",
      emailErr
    );
  }

  return { ok: true };
}

/**
 * Approve a pending (guest) free-text tribute.
 * Allowed for: memorial owner or platform admin.
 */
export async function approveTributeAction(
  id: string
): Promise<TributeActionResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to approve a tribute." };
  }

  const { data: tribute, error: tributeError } = await supabase
    .from("virtual_tributes")
    .select("id, memorial_id, is_approved, store_item_id")
    .eq("id", id)
    .maybeSingle();

  if (tributeError || !tribute) {
    return { ok: false, error: "Tribute not found." };
  }

  if (tribute.is_approved) {
    return { ok: true };
  }

  // Paid tributes are created approved; do not use this path for store purchases.
  if (tribute.store_item_id) {
    return {
      ok: false,
      error: "This tribute does not require approval."
    };
  }

  const { data: memorial } = await supabase
    .from("memorials")
    .select("owner_id")
    .eq("id", tribute.memorial_id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";
  const isOwner = memorial?.owner_id === user.id;

  if (!isOwner && !isAdmin) {
    return {
      ok: false,
      error: "You do not have permission to approve this tribute."
    };
  }

  const { error } = await supabase
    .from("virtual_tributes")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Failed to approve tribute." };
  }

  return { ok: true };
}

type DeleteTributeInput = {
  id: string;
};

export async function deleteTributeAction(
  input: DeleteTributeInput
): Promise<TributeActionResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to delete a tribute." };
  }

  // Check ownership or admin
  const { data: tribute, error: tributeError } = await supabase
    .from("virtual_tributes")
    .select("id, memorial_id")
    .eq("id", input.id)
    .maybeSingle();

  if (tributeError || !tribute) {
    return { ok: false, error: "Tribute not found." };
  }

  const { data: memorial } = await supabase
    .from("memorials")
    .select("owner_id")
    .eq("id", tribute.memorial_id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";
  const isOwner = memorial?.owner_id === user.id;

  if (!isOwner && !isAdmin) {
    return {
      ok: false,
      error: "You do not have permission to delete this tribute."
    };
  }

  const { error } = await supabase
    .from("virtual_tributes")
    .delete()
    .eq("id", input.id);

  if (error) {
    return { ok: false, error: "Failed to delete tribute. Please try again." };
  }

  return { ok: true };
}

