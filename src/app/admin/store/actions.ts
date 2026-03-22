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

  const { count, error: countErr } = await guard.supabase
    .from("virtual_tributes")
    .select("id", { count: "exact", head: true })
    .eq("store_item_id", id);

  if (countErr) {
    return { ok: false as const, error: "Could not verify tribute history" };
  }

  if ((count ?? 0) > 0) {
    return {
      ok: false as const,
      error:
        "This item cannot be deleted because it is linked to existing tributes or purchases. Deactivate it instead."
    };
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

