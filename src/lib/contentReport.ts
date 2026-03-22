export const CONTENT_REPORT_REASONS = [
  "spam",
  "offensive",
  "inappropriate",
  "other"
] as const;

export type ContentReportReason = (typeof CONTENT_REPORT_REASONS)[number];

export const CONTENT_REPORT_REASON_LABELS: Record<ContentReportReason, string> = {
  spam: "Spam or scam",
  offensive: "Offensive or hateful",
  inappropriate: "Inappropriate for a memorial",
  other: "Other"
};

export function isContentReportReason(v: string): v is ContentReportReason {
  return (CONTENT_REPORT_REASONS as readonly string[]).includes(v);
}
