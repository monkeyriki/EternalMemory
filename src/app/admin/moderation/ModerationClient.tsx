"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteTributeAction } from "@/app/memorials/[slug]/tributes/actions";
import { approveTributeAction } from "./actions";

type TributeRow = {
  id: string;
  message: string | null;
  created_at: string;
  guest_name?: string | null;
  is_approved?: boolean;
  memorial: { slug: string; full_name: string } | null;
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function TributeCard({
  t,
  onDelete,
  onApprove,
  showApprove
}: {
  t: TributeRow;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  showApprove?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    if (!onApprove) return;
    setError(null);
    setApproving(true);
    const res = await approveTributeAction(t.id);
    setApproving(false);
    if (res.ok) onApprove(t.id);
    else setError(res.error ?? "Failed to approve.");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {t.memorial?.slug ? (
            <Link
              href={`/memorials/${t.memorial.slug}`}
              className="text-sm font-semibold text-slate-900 underline-offset-2 hover:underline"
            >
              {t.memorial.full_name}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-slate-900">
              Unknown memorial
            </p>
          )}
          {t.guest_name && (
            <p className="mt-1 text-xs font-medium text-slate-600">
              Guest: {t.guest_name}
            </p>
          )}
          <p className="mt-2 text-sm text-slate-700">
            {(t.message ?? "").slice(0, 100)}
            {(t.message ?? "").length > 100 ? "…" : ""}
          </p>
          <p className="mt-2 text-xs text-slate-400">{formatDate(t.created_at)}</p>
          {error && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {showApprove && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={approving}
              className="text-xs font-medium text-amber-600 hover:underline disabled:opacity-60"
            >
              {approving ? "Approving…" : "Approve"}
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(t.id)}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModerationClient({
  pending,
  approved
}: {
  pending: TributeRow[];
  approved: TributeRow[];
}) {
  const [pendingRows, setPendingRows] = useState(pending);
  const [approvedRows, setApprovedRows] = useState(approved);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string, fromPending: boolean) => {
    setError(null);
    if (fromPending) {
      const prev = pendingRows;
      setPendingRows((cur) => cur.filter((r) => r.id !== id));
      const res = await deleteTributeAction({ id });
      if (!res.ok) {
        setPendingRows(prev);
        setError(res.error ?? "Failed to delete tribute.");
      }
    } else {
      const prev = approvedRows;
      setApprovedRows((cur) => cur.filter((r) => r.id !== id));
      const res = await deleteTributeAction({ id });
      if (!res.ok) {
        setApprovedRows(prev);
        setError(res.error ?? "Failed to delete tribute.");
      }
    }
  };

  const handleApprove = (id: string) => {
    const item = pendingRows.find((r) => r.id === id);
    if (item) {
      setPendingRows((cur) => cur.filter((r) => r.id !== id));
      setApprovedRows((cur) => [{ ...item, is_approved: true }, ...cur]);
    }
  };

  const hasAny = pendingRows.length > 0 || approvedRows.length > 0;

  if (!hasAny) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
        No tributes found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {pendingRows.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            Pending approval
          </h2>
          <div className="space-y-3">
            {pendingRows.map((t) => (
              <TributeCard
                key={t.id}
                t={t}
                onDelete={(id) => handleDelete(id, true)}
                onApprove={handleApprove}
                showApprove
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          Recent tributes
        </h2>
        <div className="space-y-3">
          {approvedRows.length === 0 ? (
            <p className="text-sm text-slate-500">No approved tributes yet.</p>
          ) : (
            approvedRows.map((t) => (
              <TributeCard
                key={t.id}
                t={t}
                onDelete={(id) => handleDelete(id, false)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

