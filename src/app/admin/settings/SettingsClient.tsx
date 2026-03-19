"use client";

import { useState } from "react";
import { deleteSettingAction, upsertSettingAction } from "./actions";

type SettingRow = {
  id: string;
  key: string;
  value: string | null;
};

export default function SettingsClient({ initial }: { initial: SettingRow[] }) {
  const [rows, setRows] = useState<SettingRow[]>(initial);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    for (const r of initial) d[r.id] = r.value ?? "";
    return d;
  });
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleSave = async (row: SettingRow) => {
    setError(null);
    const value = drafts[row.id] ?? "";
    const res = await upsertSettingAction(row.key, value);
    if (!res.ok) {
      setError(res.error ?? "Failed to save");
      return;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, value } : r))
    );
  };

  const handleDelete = async (row: SettingRow) => {
    setError(null);
    const prev = rows;
    setRows((cur) => cur.filter((r) => r.id !== row.id));
    const res = await deleteSettingAction(row.id);
    if (!res.ok) {
      setRows(prev);
      setError(res.error ?? "Failed to delete");
    }
  };

  const handleCreate = async () => {
    setError(null);
    const key = newKey.trim();
    if (!key) {
      setError("Key is required.");
      return;
    }
    setCreating(true);
    const res = await upsertSettingAction(key, newValue);
    setCreating(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to create setting");
      return;
    }
    // Reload to pick up new row id (simple approach)
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add setting</h2>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Key
            </label>
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g. ads_enabled"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Value
            </label>
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g. true"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-60"
        >
          {creating ? "Saving..." : "+ Add setting"}
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
          No settings yet.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{r.key}</p>
                </div>
                <div className="flex flex-1 items-center gap-2 sm:justify-end">
                  <input
                    value={drafts[r.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [r.id]: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:max-w-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleSave(r)}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-950"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

