"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteMemorialAsAdminAction } from "./actions";

function buildQs(q: string, pageNum: number) {
  const p = new URLSearchParams();
  if (q.trim()) p.set("q", q.trim());
  if (pageNum > 1) p.set("page", String(pageNum));
  const s = p.toString();
  return s ? `?${s}` : "";
}

type MemorialRow = {
  id: string;
  slug: string;
  full_name: string;
  owner_id: string;
  visibility: string;
  is_draft: boolean;
  created_at: string;
};

type Props = {
  initialMemorials: MemorialRow[];
  total: number;
  page: number;
  totalPages: number;
  initialQuery: string;
};

export default function MemorialsAdminClient({
  initialMemorials,
  total,
  page,
  totalPages,
  initialQuery
}: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    startTransition(() => {
      router.push(`/admin/memorials${buildQs(q, 1)}`);
    });
  };

  const onDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Permanently delete memorial “${name}” and all related data? This cannot be undone.`
      )
    ) {
      return;
    }
    setError(null);
    setPendingId(id);
    const res = await deleteMemorialAsAdminAction(id);
    setPendingId(null);
    if (!res.ok) {
      setError(res.error ?? "Delete failed.");
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSearch}
        className="flex flex-wrap items-end gap-2"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Search name or slug
          </label>
          <input
            name="q"
            type="search"
            defaultValue={initialQuery}
            placeholder="e.g. Smith or slug"
            className="w-full min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 sm:w-72"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Search
        </button>
        {initialQuery && (
          <Link
            href="/admin/memorials"
            className="text-sm text-amber-800 underline"
          >
            Clear
          </Link>
        )}
      </form>

      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-800">{total}</span> memorial(s)
        {totalPages > 1 && (
          <>
            {" "}
            · page {page} of {totalPages}
          </>
        )}
      </p>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {initialMemorials.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No memorials match your search.
        </p>
      ) : (
        <ul className="space-y-2">
          {initialMemorials.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0">
                <Link
                  href={`/memorials/${m.slug}`}
                  className="font-medium text-amber-800 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {m.full_name}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  /{m.slug} · {m.visibility}
                  {m.is_draft ? " · draft" : ""} ·{" "}
                  {new Date(m.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/memorials/${m.slug}/edit`}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  disabled={pendingId === m.id}
                  onClick={() => void onDelete(m.id, m.full_name)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
                >
                  {pendingId === m.id ? "Deleting…" : "Delete memorial"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {page > 1 && (
            <Link
              href={`/admin/memorials${buildQs(initialQuery, page - 1)}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/admin/memorials${buildQs(initialQuery, page + 1)}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
