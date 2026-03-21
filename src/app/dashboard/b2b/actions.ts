"use server";

import { randomBytes } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export type BulkMemorialRow = {
  full_name: string;
  type: "human" | "pet";
  date_of_birth?: string;
  date_of_death?: string;
  city?: string;
  visibility: "public" | "unlisted";
};

export type BulkCreateResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

function slugifyBase(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "memorial";
}

async function allocateUniqueSlug(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  fullName: string,
  maxAttempts = 10
): Promise<string> {
  const base = slugifyBase(fullName);
  for (let i = 0; i < maxAttempts; i++) {
    const suffix =
      i === 0 ? "" : `-${randomBytes(3).toString("hex")}`;
    const slug = (base + suffix).slice(0, 80);
    const { data } = await supabase
      .from("memorials")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
  }
  throw new Error("Could not allocate a unique slug.");
}

export async function bulkCreateMemorialsAction(
  rows: BulkMemorialRow[]
): Promise<BulkCreateResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "b2b") {
    return { ok: false, error: "B2B role required." };
  }

  const { data: sub } = await supabase
    .from("b2b_subscriptions")
    .select("id")
    .eq("account_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!sub) {
    return { ok: false, error: "Active B2B subscription required." };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, error: "Add at least one row." };
  }
  if (rows.length > 10) {
    return { ok: false, error: "Maximum 10 memorials per batch." };
  }

  const now = new Date().toISOString();
  const inserts: Record<string, unknown>[] = [];

  try {
    for (const row of rows) {
      const fullName = row.full_name?.trim();
      if (!fullName) {
        return { ok: false, error: "Each row needs a full name." };
      }
      const slug = await allocateUniqueSlug(supabase, fullName);
      inserts.push({
        owner_id: user.id,
        managed_by_partner_id: user.id,
        full_name: fullName,
        slug,
        type: row.type,
        date_of_birth: row.date_of_birth?.trim() || null,
        date_of_death: row.date_of_death?.trim() || null,
        city: row.city?.trim() || null,
        visibility: row.visibility,
        password_hash: null,
        is_draft: false,
        story: null,
        cover_image_url: null,
        tags: [],
        created_at: now,
        updated_at: now
      });
    }

    const { error } = await supabase.from("memorials").insert(inserts);

    if (error) {
      console.error("bulkCreateMemorialsAction insert:", error);
      if (error.code === "23505") {
        return {
          ok: false,
          error: "A slug conflict occurred. Try again."
        };
      }
      return { ok: false, error: "Failed to create memorials." };
    }

    return { ok: true, count: inserts.length };
  } catch (e) {
    console.error("bulkCreateMemorialsAction:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unexpected error."
    };
  }
}
