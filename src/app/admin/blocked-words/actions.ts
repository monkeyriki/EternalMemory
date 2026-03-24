"use server";

import { requireAdmin } from "@/lib/requireAdmin";
import { invalidateBlockedWordsCache } from "@/lib/profanityEn";

export type BlockedWordActionResult =
  | { ok: true }
  | { ok: false; error: string };

const MAX_WORD_LEN = 200;

function normalizeWord(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export async function addBlockedWordAction(rawWord: string): Promise<BlockedWordActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const word = normalizeWord(rawWord);
  if (!word) {
    return { ok: false, error: "Enter a word or phrase." };
  }
  if (word.length > MAX_WORD_LEN) {
    return { ok: false, error: `Maximum length is ${MAX_WORD_LEN} characters.` };
  }

  const { error } = await (guard.supabase as any).from("blocked_words").insert({
    word,
    is_active: true
  });

  if (error) {
    console.error("[addBlockedWordAction]", error);
    if (error.code === "23505") {
      return {
        ok: false,
        error: "This term is already on the list (active or inactive). Remove or edit the existing row."
      };
    }
    return { ok: false, error: "Could not add term." };
  }

  invalidateBlockedWordsCache();
  return { ok: true };
}

export async function setBlockedWordActiveAction(
  id: string,
  is_active: boolean
): Promise<BlockedWordActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const rowId = id?.trim();
  if (!rowId) return { ok: false, error: "Invalid row." };

  const { error } = await (guard.supabase as any)
    .from("blocked_words")
    .update({ is_active })
    .eq("id", rowId);

  if (error) {
    console.error("[setBlockedWordActiveAction]", error);
    return { ok: false, error: "Could not update term." };
  }

  invalidateBlockedWordsCache();
  return { ok: true };
}

export async function deleteBlockedWordAction(id: string): Promise<BlockedWordActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const rowId = id?.trim();
  if (!rowId) return { ok: false, error: "Invalid row." };

  const { error } = await (guard.supabase as any).from("blocked_words").delete().eq("id", rowId);

  if (error) {
    console.error("[deleteBlockedWordAction]", error);
    return { ok: false, error: "Could not delete term." };
  }

  invalidateBlockedWordsCache();
  return { ok: true };
}
