"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addIpBanAction, removeIpBanAction } from "./actions";

type BanRow = {
  id: string;
  cidr: string;
  reason: string | null;
  created_at: string;
  expires_at: string | null;
};

export default function IpBansAdminClient({ initialBans }: { initialBans: BanRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refresh = () => startTransition(() => router.refresh());

  const onAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const cidr = String(fd.get("cidr") ?? "").trim();
    const reason = String(fd.get("reason") ?? "").trim();
    const expiresRaw = String(fd.get("expires_at") ?? "").trim();

    setSubmitting(true);
    const res = await addIpBanAction({
      cidr,
      reason: reason || null,
      expiresAt: expiresRaw || null
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to add ban.");
      return;
    }
    (e.target as HTMLFormElement).reset();
    refresh();
  };

  const onRemove = async (id: string) => {
    if (!window.confirm("Remove this IP ban?")) return;
    setBusyId(id);
    setError(null);
    const res = await removeIpBanAction(id);
    setBusyId(null);
    if (!res.ok) {
      setError(res.error ?? "Failed to remove.");
      return;
    }
    refresh();
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={(ev) => void onAdd(ev)}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-semibold text-slate-900">Add ban</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              IP or CIDR <span className="text-red-600">*</span>
            </label>
            <input
              name="cidr"
              required
              placeholder="203.0.113.50 or 10.0.0.0/24"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Reason (optional)
            </label>
            <input
              name="reason"
              maxLength={500}
              placeholder="Spam, abuse, …"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Expires (optional, local time)
            </label>
            <input
              name="expires_at"
              type="datetime-local"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
            <p className="mt-1 text-xs text-slate-400">
              Leave empty for a permanent ban.
            </p>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || isPending}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add ban"}
        </button>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Active bans</h2>
        {initialBans.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            No bans yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {initialBans.map((b) => {
              const expired =
                b.expires_at && new Date(b.expires_at).getTime() <= Date.now();
              return (
                <li
                  key={b.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-sm ${
                    expired
                      ? "border-slate-200 bg-slate-50 opacity-70"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-slate-900">
                      {b.cidr}
                    </p>
                    {b.reason && (
                      <p className="mt-1 text-sm text-slate-600">{b.reason}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      Added {new Date(b.created_at).toLocaleString()}
                      {b.expires_at
                        ? ` · Expires ${new Date(b.expires_at).toLocaleString()}`
                        : " · Permanent"}
                      {expired ? " (expired — middleware ignores)" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === b.id}
                    onClick={() => void onRemove(b.id)}
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {busyId === b.id ? "Removing…" : "Remove"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
