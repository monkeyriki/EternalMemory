"use server";

import bcrypt from "bcryptjs";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

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
};

export type CreateMemorialResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

const BCRYPT_ROUNDS = 12;

export async function createMemorialAction(
  input: CreateMemorialInput
): Promise<CreateMemorialResult> {
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

  let password_hash: string | null = null;
  if (input.visibility === "password_protected") {
    if (!input.password?.trim()) {
      return { ok: false, error: "Password is required for protected memorials." };
    }
    password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  const is_draft = input.status === "draft";

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
    is_draft
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

  return { ok: true, slug: data.slug };
}
