"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReportRow } from "./page";
import type { ContentReportReason } from "@/lib/contentReport";
import {
  dismissReportAction,
  markReportReviewedAction,
  notifyOwnerAboutReportAction,
  removeMemorialAsAdminAction,
  removeTributeAndReviewReportAction
} from "./actions";

const STATUS_ORDER: Record<string, number> = {
  open: 0,
  reviewed: 1,
  dismissed: 2
};

function sortReports(list: ReportRow[]): ReportRow[] {
  return [...list].sort((a, b) => {
    const sa = STATUS_ORDER[a.status] ?? 9;
    const sb = STATUS_ORDER[b.status] ?? 9;
    if (sa !== sb) return sa - sb;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

type Props = {
  initialReports: ReportRow[];
  reasonLabels: Record<ContentReportReason, string>;
};

export default function ReportsQueueClient({
  initialReports,
  reasonLabels
}: Props) {
  const [reports, setReports] = useState<ReportRow[]>(() =>
    sortReports(initialReports)
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmMemorialId, setConfirmMemorialId] = useState<string | null>(null);

  const openCount = useMemo(
    () => reports.filter((r) => r.status === "open").length,
    [reports]
  );

  const reasonLabel = (r: string) =>
    reasonLabels[r as ContentReportReason] ?? r;

  const run = async (id: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusyId(id);
    setError(null);
    const res = await fn();
    setBusyId(null);
    if (!res.ok) {
      setError(res.error ?? "Action failed.");
      return false;
    }
    return true;
  };

  const refreshRow = (id: string, patch: Partial<ReportRow>) => {
    setReports((prev) =>
      sortReports(prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    );
  };

  const onDismiss = async (id: string) => {
    const ok = await run(id, () => dismissReportAction(id));
    if (!ok) return;
    refreshRow(id, {
      status: "dismissed",
      reviewed_at: new Date().toISOString()
    });
  };

  const onMarkReviewed = async (id: string) => {
    const ok = await run(id, () => markReportReviewedAction(id));
    if (!ok) return;
    refreshRow(id, {
      status: "reviewed",
      reviewed_at: new Date().toISOString()
    });
  };

  const onRemoveTribute = async (reportId: string, tributeId: string) => {
    if (
      !window.confirm(
        "Remove this guestbook entry permanently? This cannot be undone."
      )
    ) {
      return;
    }
    const ok = await run(reportId, () =>
      removeTributeAndReviewReportAction(reportId, tributeId)
    );
    if (!ok) return;
    refreshRow(reportId, {
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
      tribute: null,
      tribute_id: null
    });
  };

  const onNotifyOwner = async (id: string) => {
    const ok = await run(id, () => notifyOwnerAboutReportAction(id));
    if (!ok) return;
    setError(null);
    alert("Email sent to the memorial owner (if Resend is configured).");
  };

  const onRemoveMemorial = async (report: ReportRow) => {
    if (confirmMemorialId !== report.memorial_id) {
      setConfirmMemorialId(report.memorial_id);
      setError(null);
      return;
    }
    const ok = await run(report.id, () =>
      removeMemorialAsAdminAction(report.memorial_id)
    );
    if (!ok) return;
    setConfirmMemorialId(null);
    setReports((prev) => prev.filter((r) => r.memorial_id !== report.memorial_id));
  };

  if (reports.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No reports yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-800">{openCount}</span> open
      </p>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <ul className="space-y-4">
        {reports.map((r) => {
          const memorial = r.memorial;
          const slug = memorial?.slug ?? "";
          const name = memorial?.full_name ?? "Unknown memorial";
          const isOpen = r.status === "open";
          const isTribute = !!r.tribute_id && !!r.tribute;
          const busy = busyId === r.id;

          return (
            <li
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.status === "open"
                          ? "bg-amber-100 text-amber-900"
                          : r.status === "reviewed"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-slate-900">
                    <Link
                      href={`/memorials/${slug}`}
                      className="text-amber-800 underline-offset-2 hover:underline"
                    >
                      {name}
                    </Link>
                  </p>
                  <p className="text-sm text-slate-600">
                    Target:{" "}
                    <strong>{isTribute ? "Guestbook entry" : "Memorial page"}</strong>
                    {" · "}
                    Reason: <strong>{reasonLabel(r.reason)}</strong>
                  </p>
                  {isTribute && r.tribute?.message && (
                    <blockquote className="mt-2 border-l-2 border-slate-200 pl-3 text-sm text-slate-700">
                      {r.tribute.message}
                      {r.tribute.guest_name && (
                        <span className="mt-1 block text-xs text-slate-500">
                          — {r.tribute.guest_name}
                        </span>
                      )}
                    </blockquote>
                  )}
                  {r.custom_message?.trim() && (
                    <p className="mt-2 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Reporter note:</span>{" "}
                      {r.custom_message.trim()}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {isOpen && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onDismiss(r.id)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onMarkReviewed(r.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Mark reviewed (no removal)
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onNotifyOwner(r.id)}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                    >
                      Email owner
                    </button>
                    {isTribute && r.tribute_id && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void onRemoveTribute(r.id, r.tribute_id!)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Remove entry
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onRemoveMemorial(r)}
                      className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
                    >
                      {confirmMemorialId === r.memorial_id
                        ? "Click again to delete memorial"
                        : "Remove entire memorial"}
                    </button>
                  </>
                )}
                {r.status !== "open" && (
                  <span className="text-xs text-slate-400">
                    {r.reviewed_at
                      ? `Closed ${new Date(r.reviewed_at).toLocaleString()}`
                      : ""}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
