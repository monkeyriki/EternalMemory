"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  addBlockedWordAction,
  deleteBlockedWordAction,
  setBlockedWordActiveAction
} from "./actions";

export type BlockedWordRow = {
  id: string;
  word: string;
  is_active: boolean;
  created_at: string;
};

type FilterMode = "all" | "active" | "inactive";

export default function BlockedWordsAdminClient({
  initialRows
}: {
  initialRows: BlockedWordRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [isPending, startTransition] = useTransition();

  const refresh = () => startTransition(() => router.refresh());

  const filtered = useMemo(() => {
    if (filter === "active") return initialRows.filter((r) => r.is_active);
    if (filter === "inactive") return initialRows.filter((r) => !r.is_active);
    return initialRows;
  }, [initialRows, filter]);

  const onAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const word = String(fd.get("word") ?? "");

    setSubmitting(true);
    const res = await addBlockedWordAction(word);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to add.");
      return;
    }
    (e.target as HTMLFormElement).reset();
    refresh();
  };

  const onToggleActive = async (id: string, nextActive: boolean) => {
    setBusyId(id);
    setError(null);
    const res = await setBlockedWordActiveAction(id, nextActive);
    setBusyId(null);
    if (!res.ok) {
      setError(res.error ?? "Failed to update.");
      return;
    }
    refresh();
  };

  const onDelete = async (id: string, word: string) => {
    if (!window.confirm(`Permanently remove “${word}” from the blocklist?`)) return;
    setBusyId(id);
    setError(null);
    const res = await deleteBlockedWordAction(id);
    setBusyId(null);
    if (!res.ok) {
      setError(res.error ?? "Failed to delete.");
      return;
    }
    refresh();
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={(ev) => void onAdd(ev)}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-900">Add blocked term</h2>
        <p className="text-xs text-slate-600">
          Single words match as whole words. Multi-word rows match as phrases (substring in the
          message). Changes apply within about a minute for cached requests.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="bw-word" className="mb-1 block text-xs font-medium text-slate-600">
              Word or phrase <span className="text-red-600">*</span>
            </label>
            <input
              id="bw-word"
              name="word"
              required
              maxLength={200}
              placeholder="e.g. spam phrase or a single word"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-950 disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add"}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Blocklist</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="bw-filter" className="text-xs font-medium text-slate-600">
              Show
            </label>
            <select
              id="bw-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterMode)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70"
            >
              <option value="all">All ({initialRows.length})</option>
              <option value="active">
                Active only ({initialRows.filter((r) => r.is_active).length})
              </option>
              <option value="inactive">
                Inactive only ({initialRows.filter((r) => !r.is_active).length})
              </option>
            </select>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        {isPending && (
          <p className="mb-2 text-xs text-slate-500">Refreshing…</p>
        )}

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-600">
            {filter === "all"
              ? "No terms yet. Add one above."
              : "No terms match this filter."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-slate-900 break-words">{row.word}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Added{" "}
                    {new Date(row.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.is_active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {row.is_active ? "Active" : "Inactive"}
                  </span>
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() =>
                      void onToggleActive(row.id, !row.is_active)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {row.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => void onDelete(row.id, row.word)}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
