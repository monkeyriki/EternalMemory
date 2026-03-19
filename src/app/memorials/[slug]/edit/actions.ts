"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";

type UpdateMemorialInput = {
  id: string;
  type: "human" | "pet";
  fullName: string;
  slug: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  city?: string;
  visibility: "public" | "unlisted" | "password_protected";
  status: "draft" | "publish";
  story: string | null;
  coverImageUrl: string | null;
};

type UpdateMemorialResult = {
  ok: boolean;
  error?: string;
};

export async function updateMemorialAction(
  input: UpdateMemorialInput
): Promise<UpdateMemorialResult> {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to edit a memorial." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("memorials")
    .select("id, owner_id")
    .eq("id", input.id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, error: "Memorial not found." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.role === "admin";

  if (existing.owner_id !== user.id && !isAdmin) {
    return { ok: false, error: "You do not have permission to edit this memorial." };
  }

  const updates: Record<string, unknown> = {
    type: input.type,
    full_name: input.fullName,
    slug: input.slug,
    visibility: input.visibility,
    is_draft: input.status === "draft",
    story: input.story,
    cover_image_url: input.coverImageUrl
  };

  updates.date_of_birth = input.dateOfBirth ?? null;
  updates.date_of_death = input.dateOfDeath ?? null;
  updates.city = input.city ?? null;

  const { error: updateError } = await supabase
    .from("memorials")
    .update(updates)
    .eq("id", input.id);

  if (updateError) {
    return { ok: false, error: "Failed to update memorial. Please try again." };
  }

  return { ok: true };
}

