export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

function baseUrl(appUrl: string): string {
  return appUrl.replace(/\/$/, "");
}

function memorialLink(appUrl: string, memorialSlug: string): string {
  return `${baseUrl(appUrl)}/memorials/${encodeURIComponent(memorialSlug)}`;
}

function moderationLink(appUrl: string): string {
  return `${baseUrl(appUrl)}/admin/moderation`;
}

/** Escape text for safe HTML body (minimal templates). */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoneyMinorUnits(amountCents: number, currency: string): string {
  const code = currency.toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${code}`;
  }
}

export function tributePurchasedOwnerEmail({
  ownerName,
  memorialName,
  memorialSlug,
  itemName,
  appUrl
}: {
  ownerName: string;
  memorialName: string;
  memorialSlug: string;
  itemName: string;
  appUrl: string;
}): EmailContent {
  const link = memorialLink(appUrl, memorialSlug);
  const safeOwner = escapeHtml(ownerName);
  const safeMemorial = escapeHtml(memorialName);
  const safeItem = escapeHtml(itemName);
  const subject = `Someone left a tribute on ${memorialName}`;
  const html = `<p>Hi ${safeOwner},</p>
<p>Someone purchased a <strong>${safeItem}</strong> for <strong>${safeMemorial}</strong>.</p>
<p><a href="${escapeHtml(link)}">View the memorial</a></p>`;
  const text = `Hi ${ownerName},

Someone purchased a ${itemName} for ${memorialName}.

View the memorial: ${link}`;
  return { subject, html, text };
}

export function tributeReceiptEmail({
  memorialName,
  memorialSlug,
  itemName,
  amount,
  currency,
  appUrl
}: {
  memorialName: string;
  memorialSlug: string;
  itemName: string;
  /** Amount in smallest currency unit (e.g. cents), as from Stripe */
  amount: number;
  currency: string;
  appUrl: string;
}): EmailContent {
  const link = memorialLink(appUrl, memorialSlug);
  const safeMemorial = escapeHtml(memorialName);
  const safeItem = escapeHtml(itemName);
  const money = formatMoneyMinorUnits(amount, currency);
  const subject = `Your tribute receipt — ${memorialName}`;
  const html = `<p>Thank you for your tribute on <strong>${safeMemorial}</strong>.</p>
<p>You purchased: <strong>${safeItem}</strong> for ${escapeHtml(money)}.</p>
<p><a href="${escapeHtml(link)}">View the memorial</a></p>`;
  const text = `Thank you for your tribute on ${memorialName}.

You purchased: ${itemName} for ${money}.

View the memorial: ${link}`;
  return { subject, html, text };
}

export function guestTributePendingOwnerEmail({
  ownerName,
  guestName,
  memorialName,
  appUrl
}: {
  ownerName: string;
  guestName: string;
  memorialName: string;
  appUrl: string;
}): EmailContent {
  const modLink = moderationLink(appUrl);
  const safeOwner = escapeHtml(ownerName);
  const safeGuest = escapeHtml(guestName);
  const safeMemorial = escapeHtml(memorialName);
  const subject = `A guest left a condolence on ${memorialName} — pending approval`;
  const html = `<p>Hi ${safeOwner},</p>
<p>A guest (<strong>${safeGuest}</strong>) left a condolence on <strong>${safeMemorial}</strong>.</p>
<p><a href="${escapeHtml(modLink)}">Review and approve it in your admin panel</a></p>`;
  const text = `Hi ${ownerName},

A guest (${guestName}) left a condolence on ${memorialName}.

Review and approve it in your admin panel: ${modLink}`;
  return { subject, html, text };
}

/** Owner notified that their memorial or a guestbook entry was reported (moderation team). */
export function contentReportOwnerEmail({
  ownerName,
  memorialName,
  memorialSlug,
  reasonLabel,
  isTributeReport,
  reporterNote,
  appUrl
}: {
  ownerName: string;
  memorialName: string;
  memorialSlug: string;
  reasonLabel: string;
  isTributeReport: boolean;
  reporterNote: string | null;
  appUrl: string;
}): EmailContent {
  const link = memorialLink(appUrl, memorialSlug);
  const safeOwner = escapeHtml(ownerName);
  const safeReason = escapeHtml(reasonLabel);
  const target = isTributeReport
    ? "A guestbook entry on your memorial was reported"
    : "Your memorial page was reported";
  const subject = `Content report — ${memorialName}`;
  const noteBlock =
    reporterNote && reporterNote.trim().length > 0
      ? `<p><strong>Reporter note (may be empty):</strong></p><blockquote style="margin:0 0 1em;border-left:3px solid #e2e8f0;padding-left:12px;color:#475569;">${escapeHtml(reporterNote.trim())}</blockquote>`
      : "";
  const html = `<p>Hi ${safeOwner},</p>
<p>${escapeHtml(target)}. Reason category: <strong>${safeReason}</strong>.</p>
${noteBlock}
<p>Our team may review and take action if needed. If you believe this is a mistake, you can reply to this email or contact support.</p>
<p><a href="${escapeHtml(link)}">View your memorial</a></p>`;
  const text = `Hi ${ownerName},

${target}. Reason: ${reasonLabel}.

${reporterNote?.trim() ? `Note from reporter:\n${reporterNote.trim()}\n\n` : ""}View your memorial: ${link}`;
  return { subject, html, text };
}
