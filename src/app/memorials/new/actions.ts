"use server";

import bcrypt from "bcryptjs";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { replaceMemorialGalleryRows } from "@/app/memorials/actions/syncMemorialGallery";
import { normalizeTagArray } from "@/lib/memorialTags";
import { assertIpNotBanned } from "@/lib/ipBanCheck";

export type CreateMemorialInput = {
  type: "human" | "pet";
  fullName: string;
  slug: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  city?: string;
  visibility: "public" | "unlisted" | "password_protected";
  password?: string;
  status: "draft" | "publish";
  story?: string;
  coverImageUrl?: string;
  /** Additional photos (not cover); max 24 URLs */
  galleryImageUrls?: string[];
  tags?: string[];
};

export type CreateMemorialResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

const BCRYPT_ROUNDS = 12;

export async function createMemorialAction(
  input: CreateMemorialInput
): Promise<CreateMemorialResult> {
  const ipOk = await assertIpNotBanned();
  if (!ipOk.ok) {
    return { ok: false, error: ipOk.error };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to create a memorial." };
  }

  const slug = input.slug.trim().toLowerCase();
  if (!slug) {
    return { ok: false, error: "Invalid memorial URL (slug)." };
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  if (input.dateOfDeath && input.dateOfDeath > todayIso) {
    return { ok: false, error: "Date of death cannot be in the future." };
  }

  let password_hash: string | null = null;
  if (input.visibility === "password_protected") {
    if (!input.password?.trim()) {
      return { ok: false, error: "Password is required for protected memorials." };
    }
    password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  const is_draft = input.status === "draft";
  console.log(
    "[createMemorial] input.status:",
    input.status,
    "=> is_draft:",
    is_draft
  );

  const insertRow = {
    owner_id: user.id,
    type: input.type,
    full_name: input.fullName.trim(),
    slug,
    date_of_birth: input.dateOfBirth || null,
    date_of_death: input.dateOfDeath || null,
    city: input.city?.trim() || null,
    visibility: input.visibility,
    password_hash,
    is_draft,
    story: input.story ?? null,
    cover_image_url: input.coverImageUrl ?? null,
    tags: normalizeTagArray(input.tags)
  };

  // Logs appear in the terminal where `npm run dev` runs (not the browser console).
  console.log("[createMemorial] auth.uid context: user.id =", user.id);
  console.log("[createMemorial] insert payload:", JSON.stringify(insertRow, null, 2));

  const { data, error } = await supabase
    .from("memorials")
    .insert(insertRow)
    .select("id, slug, owner_id, full_name, is_draft")
    .maybeSingle();

  console.log("[createMemorial] Supabase insert data:", data);
  console.log("[createMemorial] Supabase insert error:", error);

  if (error) {
    const detail = [
      error.message,
      error.code ? `code=${error.code}` : "",
      error.details ? `details=${error.details}` : "",
      error.hint ? `hint=${error.hint}` : ""
    ]
      .filter(Boolean)
      .join(" | ");

    console.log("[createMemorial] full error object:", JSON.stringify(error, null, 2));

    if (error.code === "23505") {
      return {
        ok: false,
        error: "This memorial URL is already in use. Please choose another."
      };
    }

    // Surface DB/RLS/FK messages so you can debug in the UI too
    return {
      ok: false,
      error: `Save failed: ${detail}`
    };
  }

  if (!data) {
    console.warn(
      "[createMemorial] Insert reported no error but .select() returned no row (check RLS SELECT after INSERT)."
    );
    return {
      ok: false,
      error:
        "Row may have been created but could not be read back. Check Table Editor and server terminal logs."
    };
  }

  const gallery = input.galleryImageUrls ?? [];
  if (gallery.length > 0) {
    const gal = await replaceMemorialGalleryRows(supabase, data.id, gallery);
    if (!gal.ok) {
      return { ok: false, error: gal.error };
    }
  }

  return { ok: true, slug: data.slug };
}
