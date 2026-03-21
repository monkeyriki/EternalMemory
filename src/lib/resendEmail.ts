import { Resend } from "resend";

/** Mittente predefinito solo per test su account Resend (limitato). In produzione usa EMAIL_FROM con dominio verificato. */
const FALLBACK_FROM = "EternalMemory <onboarding@resend.dev>";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Es. `EternalMemory <noreply@tuodominio.com>` — deve essere un dominio verificato su Resend */
  from?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string; skipped?: boolean };

/**
 * Invia un’email transazionale via Resend (solo server: route handler, server actions).
 * Se `RESEND_API_KEY` manca, non lancia: ritorna `{ ok: false, skipped: true }` (utile in dev).
 */
export async function sendTransactionalEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "[resendEmail] RESEND_API_KEY non impostata: email non inviata."
    );
    return { ok: false, error: "missing_resend_api_key", skipped: true };
  }

  const from =
    input.from?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    FALLBACK_FROM;

  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo
  });

  if (error) {
    console.error("[resendEmail]", error);
    return { ok: false, error: error.message };
  }

  if (!data?.id) {
    return { ok: false, error: "no_message_id" };
  }

  return { ok: true, id: data.id };
}
