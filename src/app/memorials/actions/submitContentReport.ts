"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  isContentReportReason,
  type ContentReportReason
} from "@/lib/contentReport";
import {
  getActiveBlockedWordsEn,
  PROFANITY_BLOCKED_MESSAGE,
  textMatchesBlockedTerms
} from "@/lib/profanityEn";
import { assertPasswordMemorialInteractionAllowed } from "@/lib/memorialPasswordAccess";
import { assertIpNotBanned } from "@/lib/ipBanCheck";

export type SubmitContentReportResult =
  | { ok: true }
  | { ok: false; error: string };

const MAX_MESSAGE = 1000;

export async function submitContentReportAction(input: {
  memorial_id: string;
  tribute_id?: string | null;
  reason: string;
  custom_message?: string | null;
}): Promise<SubmitContentReportResult> {
  const memorialId = input.memorial_id?.trim();
  if (!memorialId) {
    return { ok: false, error: "Invalid memorial." };
  }

  if (!isContentReportReason(input.reason)) {
    return { ok: false, error: "Please choose a valid reason." };
  }
  const reason = input.reason as ContentReportReason;

  const ipOk = await assertIpNotBanned();
  if (!ipOk.ok) {
    return { ok: false, error: ipOk.error };
  }

  let custom =
    typeof input.custom_message === "string"
      ? input.custom_message.trim().slice(0, MAX_MESSAGE)
      : "";
  if (custom.length === 0) custom = "";

  const access = await assertPasswordMemorialInteractionAllowed(memorialId);
  if (!access.ok) {
    return { ok: false, error: access.error };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: memorial, error: memErr } = await supabase
    .from("memorials")
    .select("id")
    .eq("id", memorialId)
    .maybeSingle();

  if (memErr || !memorial) {
    return { ok: false, error: "Memorial not found." };
  }

  let tributeId: string | null = null;
  if (input.tribute_id?.trim()) {
    const tid = input.tribute_id.trim();
    const { data: tr, error: trErr } = await supabase
      .from("virtual_tributes")
      .select("id, memorial_id")
      .eq("id", tid)
      .maybeSingle();

    if (trErr || !tr) {
      return { ok: false, error: "Entry not found." };
    }
    if (tr.memorial_id !== memorialId) {
      return { ok: false, error: "Invalid report target." };
    }
    tributeId = tid;
  }

  if (custom) {
    const blocked = await getActiveBlockedWordsEn(supabase);
    if (textMatchesBlockedTerms(custom, blocked)) {
      return { ok: false, error: PROFANITY_BLOCKED_MESSAGE };
    }
  }

  const { error: insErr } = await supabase.from("content_reports").insert({
    reporter_id: user?.id ?? null,
    memorial_id: memorialId,
    tribute_id: tributeId,
    reason,
    custom_message: custom || null,
    status: "open"
  });

  if (insErr) {
    console.error("[submitContentReport]", insErr);
    return { ok: false, error: "Could not submit report. Please try again." };
  }

  return { ok: true };
}
