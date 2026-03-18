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
      return { ok: false, error: "Password obbligatoria per memoriali protetti." };
    }
    password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  const is_draft = input.status === "draft";

  const { error } = await supabase.from("memorials").insert({
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
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "This memorial URL is already in use. Please choose another."
      };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, slug };
}
