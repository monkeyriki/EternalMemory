/** Shown in UI and ops emails when NEXT_PUBLIC_PRIVACY_EMAIL is unset. */
export const PRIVACY_EMAIL_FALLBACK = "privacy@eternalmemory.example";

/**
 * Privacy / data-rights contact (GDPR, CCPA requests). Set NEXT_PUBLIC_PRIVACY_EMAIL in production.
 */
export function getPrivacyEmail(): string {
  const v = process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim();
  if (v && v.includes("@")) return v;
  return PRIVACY_EMAIL_FALLBACK;
}
