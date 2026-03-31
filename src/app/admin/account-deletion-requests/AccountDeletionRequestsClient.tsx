"use client";

import { useMemo, useState } from "react";
import { updateAccountDeletionRequestAction } from "./actions";

export type AccountDeletionRequestRow = {
  id: string;
  user_id: string;
  email: string | null;
  reason: string | null;
  status: "pending" | "in_review" | "completed" | "rejected";
  requested_at: string;
  processed_at: string | null;
  admin_note: string | null;
};

const STATUS_OPTIONS: Array<AccountDeletionRequestRow["status"]> = [
  "pending",
  "in_review",
  "completed",
  "rejected"
];

const STATUS_BADGE: Record<AccountDeletionRequestRow["status"], string> = {
  pending: "bg-amber-100 text-amber-900",
  in_review: "bg-sky-100 text-sky-900",
  completed: "bg-emerald-100 text-emerald-900",
  rejected: "bg-slate-200 text-slate-700"
};

const utcDateTime = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC"
});

function formatUtcDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return `${utcDateTime.format(d)} UTC`;
}

function sortRows(rows: AccountDeletionRequestRow[]) {
  const rank: Record<AccountDeletionRequestRow["status"], number> = {
    pending: 0,
    in_review: 1,
    completed: 2,
    rejected: 3
  };
  return [...rows].sort((a, b) => {
    const ra = rank[a.status];
    const rb = rank[b.status];
    if (ra !== rb) return ra - rb;
    return new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime();
  });
}

export default function AccountDeletionRequestsClient({
  initialRows
}: {
  initialRows: AccountDeletionRequestRow[];
}) {
  const [rows, setRows] = useState<AccountDeletionRequestRow[]>(() =>
    sortRows(initialRows)
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openCount = useMemo(
    () => rows.filter((r) => r.status === "pending" || r.status === "in_review").length,
    [rows]
  );

  async function onSave(
    id: string,
    status: AccountDeletionRequestRow["status"],
    adminNote: string
  ) {
    setBusyId(id);
    setError(null);
    const res = await updateAccountDeletionRequestAction({
      id,
      status,
      adminNote
    });
    setBusyId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const now = new Date().toISOString();
    setRows((prev) =>
      sortRows(
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                admin_note: adminNote.trim() || null,
                processed_at:
                  status === "pending" || status === "in_review"
                    ? null
                    : r.processed_at ?? now
              }
            : r
        )
      )
    );
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No account deletion requests yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-900">{openCount}</span> open
        requests
      </p>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <ul className="space-y-4">
        {rows.map((r) => (
          <RequestRow
            key={r.id}
            row={r}
            disabled={busyId === r.id}
            onSave={onSave}
          />
        ))}
      </ul>
    </div>
  );
}

function RequestRow({
  row,
  disabled,
  onSave
}: {
  row: AccountDeletionRequestRow;
  disabled: boolean;
  onSave: (
    id: string,
    status: AccountDeletionRequestRow["status"],
    adminNote: string
  ) => Promise<void>;
}) {
  const [status, setStatus] = useState<AccountDeletionRequestRow["status"]>(
    row.status
  );
  const [adminNote, setAdminNote] = useState(row.admin_note ?? "");

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[row.status]}`}
            >
              {row.status}
            </span>
            <span className="text-xs text-slate-500">
              {formatUtcDateTime(row.requested_at)}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-800">
            <strong>Email:</strong> {row.email || "Unknown"}
          </p>
          <p className="text-xs font-mono text-slate-500">{row.user_id}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">User reason</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-700">
            {row.reason?.trim() || "No reason provided."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto]">
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as AccountDeletionRequestRow["status"])
            }
            disabled={disabled}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/80 disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            disabled={disabled}
            placeholder="Admin note (optional)"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/80 disabled:opacity-60"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => void onSave(row.id, status, adminNote)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Save
          </button>
        </div>

        {row.processed_at ? (
          <p className="text-xs text-slate-500">
            Processed at: {formatUtcDateTime(row.processed_at)}
          </p>
        ) : null}
      </div>
    </li>
  );
}
