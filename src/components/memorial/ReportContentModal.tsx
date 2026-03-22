"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { submitContentReportAction } from "@/app/memorials/actions/submitContentReport";
import {
  CONTENT_REPORT_REASON_LABELS,
  CONTENT_REPORT_REASONS,
  type ContentReportReason
} from "@/lib/contentReport";

type Props = {
  memorialId: string;
  /** If set, report targets this guestbook/tribute row; otherwise the memorial page. */
  tributeId?: string | null;
  title: string;
  open: boolean;
  onClose: () => void;
};

export function ReportContentModal({
  memorialId,
  tributeId,
  title,
  open,
  onClose
}: Props) {
  const [reason, setReason] = useState<ContentReportReason>("other");
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await submitContentReportAction({
      memorial_id: memorialId,
      tribute_id: tributeId ?? null,
      reason,
      custom_message: customMessage.trim() || undefined
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setCustomMessage("");
      setReason("other");
      onClose();
    }, 2000);
  };

  const handleBackdrop = () => {
    if (!loading) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      onClick={handleBackdrop}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <Flag className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="report-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Reports are reviewed by our team. Misuse may result in action on your account.
            </p>
          </div>
        </div>

        {done ? (
          <p className="mt-6 text-sm font-medium text-emerald-700">
            Thank you — your report was submitted.
          </p>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Reason
              </p>
              <div className="space-y-2">
                {CONTENT_REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50/50"
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="mt-1"
                    />
                    <span className="text-slate-800">
                      {CONTENT_REPORT_REASON_LABELS[r]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Details <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value.slice(0, 1000))}
                rows={4}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Add context that helps moderators…"
              />
              <p className="mt-1 text-xs text-slate-400">
                {customMessage.length} / 1000
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {loading ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
