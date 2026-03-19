"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";

const BUCKET = "memorial-photos";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];

type UploadResult = {
  ok: boolean;
  url?: string;
  error?: string;
};

export async function uploadCoverImageAction(
  formData: FormData
): Promise<UploadResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "No file provided" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: "Invalid file type. Use JPEG, PNG, WebP or GIF."
    };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, error: "File too large. Maximum size is 5MB." };
  }

  const safeName = file.name.replace(/[^a-z0-9.]/gi, "_");
  const filename = `${user.id}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    return { ok: false, error: "Upload failed" };
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return { ok: true, url: publicUrl };
}
