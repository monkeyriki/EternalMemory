"use client";

import { useMemo, useState } from "react";
import {
  createStoreItemAction,
  toggleStoreItemActiveAction,
  updateStoreItemAction,
  type StoreItemInput
} from "./actions";

type StoreItem = {
  id: string;
  name: string | null;
  description: string | null;
  category: string | null;
  price_cents: number | null;
  currency: string | null;
  image_url: string | null;
  is_premium: boolean | null;
  is_active: boolean | null;
  created_at?: string | null;
};

function formatMoney(priceCents: number | null, currency: string | null) {
  const cents = priceCents ?? 0;
  const curr = (currency ?? "usd").toUpperCase();
  const value = (cents / 100).toFixed(2);
  return `${curr} ${value}`;
}

function toInput(item?: StoreItem): StoreItemInput {
  return {
    id: item?.id,
    name: item?.name ?? "",
    description: item?.description ?? "",
    category: item?.category ?? "",
    price_cents: item?.price_cents ?? 0,
    currency: item?.currency ?? "usd",
    image_url: item?.image_url ?? "",
    is_premium: item?.is_premium ?? false,
    is_active: item?.is_active ?? true
  };
}

export default function StoreAdmin({ initialItems }: { initialItems: StoreItem[] }) {
  const [items, setItems] = useState<StoreItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<StoreItemInput>(() => toInput());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const activeItem = useMemo(
    () => (editingId && editingId !== "new" ? items.find((i) => i.id === editingId) : null),
    [editingId, items]
  );

  const startNew = () => {
    setError(null);
    setEditingId("new");
    setForm(toInput());
  };

  const startEdit = (id: string) => {
    setError(null);
    setEditingId(id);
    setForm(toInput(items.find((i) => i.id === id)));
  };

  const cancel = () => {
    setError(null);
    setEditingId(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editingId === "new") {
        const res = await createStoreItemAction(form);
        if (!res.ok) throw new Error(res.error || "Failed to create item");
        // refresh list by forcing reload (simple for now)
        window.location.reload();
        return;
      }
      if (typeof editingId === "string") {
        const res = await updateStoreItemAction({ ...form, id: editingId });
        if (!res.ok) throw new Error(res.error || "Failed to update item");
        setItems((prev) =>
          prev.map((i) => (i.id === editingId ? { ...i, ...form } as any : i))
        );
        setEditingId(null);
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string) => {
    setError(null);
    const prev = items;
    setItems((cur) =>
      cur.map((i) => (i.id === id ? { ...i, is_active: !i.is_active } : i))
    );
    const res = await toggleStoreItemActiveAction(id);
    if (!res.ok) {
      setItems(prev);
      setError(res.error || "Failed to toggle active");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Store items
          </h1>
          <p className="mt-1 text-sm text-slate-600">Manage virtual tribute items.</p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
        >
          + New item
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {editingId && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId === "new" ? "Create item" : "Edit item"}
            </h2>
            <button
              type="button"
              onClick={cancel}
              className="text-sm text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Category
              </label>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Price in cents
              </label>
              <input
                type="number"
                value={form.price_cents}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price_cents: Number(e.target.value) }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Currency
              </label>
              <input
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Image URL
              </label>
              <input
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_premium}
                onChange={(e) => setForm((f) => ({ ...f, is_premium: e.target.checked }))}
              />
              Premium
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-950 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
          No store items yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <div
              key={i.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">
                  {i.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  {i.category && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                      {i.category}
                    </span>
                  )}
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                    {formatMoney(i.price_cents, i.currency)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      i.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {i.is_active ? "Active" : "Inactive"}
                  </span>
                  {i.is_premium && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">
                      Premium
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => startEdit(i.id)}
                  className="text-sm text-slate-700 underline-offset-2 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(i.id)}
                  className="text-sm text-amber-700 underline-offset-2 hover:underline"
                >
                  Toggle active
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

