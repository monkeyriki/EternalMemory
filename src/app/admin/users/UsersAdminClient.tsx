"use client";

import { useState } from "react";
import { assignB2BRoleAction } from "./actions";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  role: string;
  created_at: string;
};

export function UsersAdminClient({ profiles }: { profiles: ProfileRow[] }) {
  const [msg, setMsg] = useState<string | null>(null);

  async function makeB2B(userId: string) {
    setMsg(null);
    const res = await assignB2BRoleAction(userId);
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
              <th className="px-4 py-3 font-medium">User ID</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-slate-900">
                  {p.display_name ?? "—"}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-slate-500">
                  {p.id}
                </td>
                <td className="px-4 py-3 capitalize">{p.role}</td>
                <td className="max-w-[220px] px-4 py-3">
                  {p.role === "admin" ? (
                    <span
                      className="text-xs leading-snug text-slate-500"
                      title="Use a normal account (role user), or change this row in the database if you must remove admin first."
                    >
                      Not available — admin accounts cannot be set to B2B here.
                    </span>
                  ) : p.role === "b2b" ? (
                    <span className="text-slate-500">Already B2B</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeB2B(p.id)}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                    >
                      Make B2B
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
