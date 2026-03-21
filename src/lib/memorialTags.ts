const MAX_TAGS = 20;
const MAX_TAG_LEN = 40;

/**
 * Normalize a single tag: lowercase, hyphenated slug fragment.
 */
export function normalizeTagToken(raw: string): string | null {
  const t = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, MAX_TAG_LEN);
  if (t.length < 2) return null;
  return t;
}

/**
 * Parse comma/newline-separated input into a deduped tag array (max MAX_TAGS).
 */
export function normalizeTagsFromInput(input: string | undefined | null): string[] {
  if (!input?.trim()) return [];
  const parts = input.split(/[\n,]+/);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    const n = normalizeTagToken(p);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

export function tagsToInputString(tags: string[] | null | undefined): string {
  if (!tags?.length) return "";
  return tags.join(", ");
}

/** Re-normalize tag strings from client (server-side trust boundary). */
export function normalizeTagArray(arr: string[] | undefined | null): string[] {
  if (!arr?.length) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of arr) {
    const n = normalizeTagToken(x);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}
