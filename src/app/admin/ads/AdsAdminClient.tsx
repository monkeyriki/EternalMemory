"use client";

import { useState } from "react";
import {
  createAdSlotAction,
  setAdsEnabledAction,
  updateAdSlotAction
} from "./actions";

export type AdSlotRow = {
  id: string;
  slot_key: string;
  adsense_code: string | null;
  is_active: boolean;
  description: string | null;
};

type Props = {
  initialSlots: AdSlotRow[];
  adsEnabledInitial: boolean;
};

export default function AdsAdminClient({
  initialSlots,
  adsEnabledInitial
}: Props) {
  const [slots, setSlots] = useState<AdSlotRow[]>(initialSlots);
  const [adsEnabled, setAdsEnabled] = useState(adsEnabledInitial);
  const [toggling, setToggling] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const [draftById, setDraftById] = useState<
    Record<string, { code: string; active: boolean; desc: string }>
  >(() => {
    const d: Record<string, { code: string; active: boolean; desc: string }> = {};
    for (const s of initialSlots) {
      d[s.id] = {
        code: s.adsense_code ?? "",
        active: s.is_active,
        desc: s.description ?? ""
      };
    }
    return d;
  });

  const handleToggleGlobal = async () => {
    setError(null);
    setToggling(true);
    const next = !adsEnabled;
    const res = await setAdsEnabledAction(next);
    setToggling(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to update ads setting");
      return;
    }
    setAdsEnabled(next);
  };

  const handleSaveSlot = async (row: AdSlotRow) => {
    const d = draftById[row.id];
    if (!d) return;
    setError(null);
    setSavingId(row.id);
    const res = await updateAdSlotAction({
      id: row.id,
      adsense_code: d.code,
      is_active: d.active,
      description: d.desc || null
    });
    setSavingId(null);
    if (!res.ok) {
      setError(res.error ?? "Save failed");
      return;
    }
    setSlots((prev) =>
      prev.map((s) =>
        s.id === row.id
          ? {
              ...s,
              adsense_code: d.code.trim() || null,
              is_active: d.active,
              description: d.desc.trim() || null
            }
          : s
      )
    );
  };

  const handleCreate = async () => {
    setError(null);
    setCreating(true);
    const res = await createAdSlotAction({
      slot_key: newKey,
      description: newDesc || undefined
    });
    setCreating(false);
    if (!res.ok) {
      setError(res.error ?? "Create failed");
      return;
    }
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Global ads</h2>
        <p className="mt-1 text-sm text-slate-600">
          When off, no memorial pages show ads (even if slots have code). Uses{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">platform_settings.ads_enabled</code>
          .
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleGlobal}
            disabled={toggling}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-60 ${
              adsEnabled ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {toggling ? "Saving…" : adsEnabled ? "Turn ads off" : "Turn ads on"}
          </button>
          <span className="text-sm text-slate-600">
            Status:{" "}
            <strong className={adsEnabled ? "text-emerald-700" : "text-slate-500"}>
              {adsEnabled ? "On" : "Off"}
            </strong>
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Fixed slots</h2>
        <p className="mt-1 text-sm text-slate-600">
          Paste the full AdSense (or similar) snippet for each slot. Memorial pages use{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">memorial_top</code> and{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">memorial_bottom</code>.
        </p>

        <div className="mt-6 space-y-8">
          {slots.map((row) => {
            const d = draftById[row.id] ?? {
              code: row.adsense_code ?? "",
              active: row.is_active,
              desc: row.description ?? ""
            };
            return (
              <div
                key={row.id}
                className="border-b border-slate-100 pb-6 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-mono text-sm font-semibold text-slate-800">
                    {row.slot_key}
                  </h3>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={d.active}
                      onChange={(e) =>
                        setDraftById((prev) => ({
                          ...prev,
                          [row.id]: { ...d, active: e.target.checked }
                        }))
                      }
                    />
                    Active
                  </label>
                </div>
                <div className="mt-2">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Description
                  </label>
                  <input
                    value={d.desc}
                    onChange={(e) =>
                      setDraftById((prev) => ({
                        ...prev,
                        [row.id]: { ...d, desc: e.target.value }
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Internal note"
                  />
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Embed code (HTML + scripts)
                  </label>
                  <textarea
                    value={d.code}
                    onChange={(e) =>
                      setDraftById((prev) => ({
                        ...prev,
                        [row.id]: { ...d, code: e.target.value }
                      }))
                    }
                    rows={8}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                    placeholder="Paste AdSense unit code…"
                    spellCheck={false}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveSlot(row)}
                  disabled={savingId === row.id}
                  className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {savingId === row.id ? "Saving…" : "Save slot"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add slot</h2>
        <p className="mt-1 text-sm text-slate-600">
          Optional extra placements (you must render them in the app to use them).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Slot key</label>
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
              placeholder="e.g. memorial_sidebar"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating || !newKey.trim()}
          className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          {creating ? "Creating…" : "Create slot"}
        </button>
      </section>
    </div>
  );
}
