"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { publicUrlToStoreItemPath, STORE_ITEMS_BUCKET } from "@/lib/storeItemStorage";

async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, error: "Not authenticated", supabase };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Not authorized", supabase };
  }

  return { ok: true as const, supabase };
}

function clampHighlightDays(n: number): number {
  if (!Number.isFinite(n)) return 30;
  return Math.min(365, Math.max(1, Math.floor(n)));
}

export type StoreItemInput = {
  id?: string;
  name: string;
  description: string;
  category: string;
  price_cents: number;
  currency: string;
  image_url: string;
  is_premium: boolean;
  is_active: boolean;
  /** Days of top-of-page spotlight when premium (1–365). */
  highlight_duration_days: number;
};

export async function createStoreItemAction(input: StoreItemInput) {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const { error } = await guard.supabase.from("store_items").insert({
    name: input.name,
    description: input.description,
    category: input.category,
    price_cents: input.price_cents,
    currency: input.currency,
    image_url: input.image_url,
    is_premium: input.is_premium,
    is_active: input.is_active,
    highlight_duration_days: clampHighlightDays(input.highlight_duration_days)
  });

  if (error) return { ok: false as const, error: "Failed to create item" };
  return { ok: true as const };
}

export async function updateStoreItemAction(input: StoreItemInput & { id: string }) {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const { error } = await guard.supabase
    .from("store_items")
    .update({
      name: input.name,
      description: input.description,
      category: input.category,
      price_cents: input.price_cents,
      currency: input.currency,
      image_url: input.image_url,
      is_premium: input.is_premium,
      is_active: input.is_active,
      highlight_duration_days: clampHighlightDays(input.highlight_duration_days)
    })
    .eq("id", input.id);

  if (error) return { ok: false as const, error: "Failed to update item" };
  return { ok: true as const };
}

export async function toggleStoreItemActiveAction(id: string) {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const { data: existing } = await guard.supabase
    .from("store_items")
    .select("id, is_active")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { ok: false as const, error: "Item not found" };

  const { error } = await guard.supabase
    .from("store_items")
    .update({ is_active: !existing.is_active })
    .eq("id", id);

  if (error) return { ok: false as const, error: "Failed to toggle active" };
  return { ok: true as const };
}

export async function deleteStoreItemAction(id: string) {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const { data: row, error: fetchErr } = await guard.supabase
    .from("store_items")
    .select("id, image_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false as const, error: "Item not found" };
  }

  const { data: linkedTributes, error: linkErr } = await guard.supabase
    .from("virtual_tributes")
    .select("id, order_id")
    .eq("store_item_id", id);

  if (linkErr) {
    return { ok: false as const, error: "Could not load linked tributes." };
  }

  const orderIds = [
    ...new Set(
      (linkedTributes ?? [])
        .map((t) => t.order_id)
        .filter((oid): oid is string => typeof oid === "string" && oid.length > 0)
    )
  ];

  if ((linkedTributes?.length ?? 0) > 0) {
    const { error: tributeDelErr } = await guard.supabase
      .from("virtual_tributes")
      .delete()
      .eq("store_item_id", id);

    if (tributeDelErr) {
      console.error("[deleteStoreItem] virtual_tributes delete:", tributeDelErr);
      return { ok: false as const, error: "Failed to remove linked guestbook purchases." };
    }
  }

  if (orderIds.length > 0) {
    const { error: ordersDelErr } = await guard.supabase
      .from("orders")
      .delete()
      .in("id", orderIds);

    if (ordersDelErr) {
      console.error("[deleteStoreItem] orders delete:", ordersDelErr);
      return {
        ok: false as const,
        error:
          "Store item tributes were removed but some order rows could not be deleted. Check the database."
      };
    }
  }

  const { error: delErr } = await guard.supabase.from("store_items").delete().eq("id", id);

  if (delErr) {
    return { ok: false as const, error: "Failed to delete item" };
  }

  const path = publicUrlToStoreItemPath(row.image_url);
  if (path) {
    const { error: rmErr } = await guard.supabase.storage
      .from(STORE_ITEMS_BUCKET)
      .remove([path]);
    if (rmErr) {
      console.warn("[deleteStoreItem] storage remove failed:", rmErr);
    }
  }

  return { ok: true as const };
}

