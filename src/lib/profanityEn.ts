import type { SupabaseClient } from "@supabase/supabase-js";

/** User-facing message when text hits the blocklist (no save). */
export const PROFANITY_BLOCKED_MESSAGE =
  "This text contains language that isn’t allowed on EternalMemory. Please revise and try again.";

const CACHE_TTL_MS = 60_000;

let cache: { words: string[]; expires: number } | null = null;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * True if `text` contains any blocked term (whole-word for single tokens; phrase match for multi-word rows).
 */
export function textMatchesBlockedTerms(text: string, terms: string[]): boolean {
  if (!text || terms.length === 0) return false;
  const lower = text.toLowerCase().replace(/\s+/g, " ").trim();

  for (const raw of terms) {
    const t = raw.trim().toLowerCase();
    if (!t) continue;

    if (/\s/.test(t)) {
      const padded = ` ${lower} `;
      const needle = ` ${t.replace(/\s+/g, " ")} `;
      if (padded.includes(needle)) return true;
    } else {
      const re = new RegExp(`\\b${escapeRegex(t)}\\b`, "i");
      if (re.test(text)) return true;
    }
  }

  return false;
}

/**
 * Active blocked words from `blocked_words` (short-lived cache). Empty if table missing / error.
 */
export async function getActiveBlockedWordsEn(
  supabase: SupabaseClient
): Promise<string[]> {
  const now = Date.now();
  if (cache && cache.expires > now) {
    return cache.words;
  }

  const { data, error } = await supabase
    .from("blocked_words")
    .select("word")
    .eq("is_active", true);

  if (error) {
    console.warn("[blocked_words] fetch failed (table missing or RLS?):", error.message);
    return [];
  }

  const words = (data ?? [])
    .map((r) => (r as { word: string }).word)
    .filter((w): w is string => typeof w === "string" && w.trim().length > 0);

  cache = { words, expires: now + CACHE_TTL_MS };
  return words;
}

/** Call after admin mutates blocklist (future admin UI). */
export function invalidateBlockedWordsCache(): void {
  cache = null;
}
