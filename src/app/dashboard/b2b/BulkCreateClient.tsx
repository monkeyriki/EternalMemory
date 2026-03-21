"use client";

import { useState } from "react";
import {
  bulkCreateMemorialsAction,
  type BulkMemorialRow
} from "./actions";

type RowDraft = Omit<BulkMemorialRow, "date_of_birth" | "date_of_death"> & {
  key: string;
  date_of_birth?: string;
  date_of_death?: string;
};

const emptyRow = (): RowDraft => ({
  key: crypto.randomUUID(),
  full_name: "",
  type: "human",
  date_of_birth: undefined,
  date_of_death: undefined,
  city: "",
  visibility: "public"
});

export function BulkCreateClient() {
  const [rows, setRows] = useState<RowDraft[]>([emptyRow()]);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function addRow() {
    if (rows.length >= 10) return;
    setRows((r) => [...r, emptyRow()]);
  }

  function removeRow(key: string) {
    setRows((r) => (r.length <= 1 ? r : r.filter((x) => x.key !== key)));
  }

  function updateRow(key: string, patch: Partial<BulkMemorialRow>) {
    setRows((r) =>
      r.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setPending(true);
    try {
      const payload: BulkMemorialRow[] = rows.map(
        ({ key: _k, date_of_birth, date_of_death, ...rest }) => ({
          ...rest,
          date_of_birth: date_of_birth || undefined,
          date_of_death: date_of_death || undefined
        })
      );
      const res = await bulkCreateMemorialsAction(payload);
      if (res.ok) {
        setMessage(`Created ${res.count} memorial(s).`);
        setRows([emptyRow()]);
      } else {
        setMessage(res.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Bulk create (max 10)
        </h2>
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= 10}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          + Add row
        </button>
      </div>

      <div className="space-y-4">
        {rows.map((row, idx) => (
          <div
            key={row.key}
            className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-medium text-slate-600">
                Full name *
              </label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={row.full_name}
                onChange={(e) =>
                  updateRow(row.key, { full_name: e.target.value })
                }
                placeholder="Name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Type</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={row.type}
                onChange={(e) =>
                  updateRow(row.key, {
                    type: e.target.value as "human" | "pet"
                  })
                }
              >
                <option value="human">Human</option>
                <option value="pet">Pet</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Visibility
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={row.visibility}
                onChange={(e) =>
                  updateRow(row.key, {
                    visibility: e.target.value as BulkMemorialRow["visibility"]
                  })
                }
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Birth (optional)
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={row.date_of_birth ?? ""}
                onChange={(e) =>
                  updateRow(row.key, { date_of_birth: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Death (optional)
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={row.date_of_death || ""}
                onChange={(e) =>
                  updateRow(row.key, { date_of_death: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                City (optional)
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={row.city ?? ""}
                onChange={(e) => updateRow(row.key, { city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="flex items-end justify-end sm:col-span-2 lg:col-span-3">
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                disabled={rows.length <= 1}
                className="text-sm text-red-600 hover:underline disabled:opacity-40"
              >
                Remove row {idx + 1}
              </button>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.startsWith("Created") ? "text-green-700" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create memorials"}
      </button>
    </form>
  );
}
