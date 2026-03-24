/**
 * Validates a post-login redirect target as an in-app path only (no open redirects).
 */
export function safeAuthRedirectPath(
  raw: string | null | undefined,
  fallback = "/"
): string {
  if (raw == null || typeof raw !== "string") return fallback;
  const s = raw.trim();
  if (s === "") return fallback;
  if (!s.startsWith("/") || s.startsWith("//")) return fallback;
  if (s.includes("\\") || s.includes("://")) return fallback;
  if (s.includes("@")) return fallback;
  return s;
}
