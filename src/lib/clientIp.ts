/** First client IP from proxy headers (Vercel / typical reverse proxies). */
export function getClientIpFromHeaders(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    if (first?.trim()) return first.trim();
  }
  const real = h.get("x-real-ip");
  if (real?.trim()) return real.trim();
  return "";
}
