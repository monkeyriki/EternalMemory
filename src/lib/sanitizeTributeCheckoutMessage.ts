const MAX_LEN = 200;

/**
 * Optional short note shown with a paid virtual tribute in the guestbook.
 * Safe for Stripe metadata (plain text, bounded length).
 */
export function sanitizeTributeCheckoutMessage(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const collapsed = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!collapsed) return undefined;
  const noControls = collapsed.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  const singleLine = noControls.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  const slice = singleLine.slice(0, MAX_LEN);
  return slice.length ? slice : undefined;
}
