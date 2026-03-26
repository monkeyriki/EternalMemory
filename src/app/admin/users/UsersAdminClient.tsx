"use client";

import { useState } from "react";
import { updateUserRoleAction } from "./actions";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
};

export function UsersAdminClient({ profiles }: { profiles: ProfileRow[] }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [draftRoleByUser, setDraftRoleByUser] = useState<Record<string, string>>({});
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  async function updateRole(userId: string, currentRole: string) {
    const nextRole = (draftRoleByUser[userId] ?? currentRole) as
      | "user"
      | "b2b"
      | "admin";
    if (nextRole === currentRole) return;
    setMsg(null);
    setPendingUserId(userId);
    const res = await updateUserRoleAction(userId, nextRole);
    setPendingUserId(null);
    if (res.ok) {
      window.location.reload();
    } else {
      setMsg(res.error);
    }
  }

  return (
    <div>
      {msg && (
        <p className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800">
          {msg}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Display name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-slate-900">
                  <span title={`User ID: ${p.id}`}>{p.display_name ?? "—"}</span>
                </td>
                <td className="max-w-[260px] truncate px-4 py-3 font-mono text-xs text-slate-600">
                  {p.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={draftRoleByUser[p.id] ?? p.role}
                    onChange={(e) =>
                      setDraftRoleByUser((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs capitalize text-slate-800"
                  >
                    <option value="user">user</option>
                    <option value="b2b">b2b</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="max-w-[220px] px-4 py-3">
                  <button
                    type="button"
                    onClick={() => updateRole(p.id, p.role)}
                    disabled={pendingUserId === p.id}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-60"
                  >
                    {pendingUserId === p.id ? "Saving..." : "Save role"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
