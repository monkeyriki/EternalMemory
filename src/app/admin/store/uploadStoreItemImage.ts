"use server";

import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { STORE_ITEMS_BUCKET } from "@/lib/storeItemStorage";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB — icons / SVG

const ALLOWED_TYPES = new Set([
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/webp"
]);

type UploadResult = {
  ok: boolean;
  url?: string;
  error?: string;
};

function isLikelySvg(file: File): boolean {
  return file.name.toLowerCase().endsWith(".svg");
}

export async function uploadStoreItemImageAction(
  formData: FormData
): Promise<UploadResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Not authorized" };
  }

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "No file provided" };
  }

  const typeOk =
    ALLOWED_TYPES.has(file.type) ||
    (isLikelySvg(file) &&
      (!file.type || file.type === "application/octet-stream" || file.type === "text/xml"));

  if (!typeOk) {
    return {
      ok: false,
      error: "Invalid file type. Use SVG, PNG, JPEG, or WebP."
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, error: "File too large. Maximum size is 2MB." };
  }

  const safeName = file.name.replace(/[^a-z0-9.]/gi, "_").slice(0, 80);
  const filename = `icons/${randomUUID()}-${safeName || "asset"}`;

  const contentType =
    file.type && ALLOWED_TYPES.has(file.type)
      ? file.type
      : isLikelySvg(file)
        ? "image/svg+xml"
        : "image/png";

  const { error } = await supabase.storage
    .from(STORE_ITEMS_BUCKET)
    .upload(filename, file, {
      contentType,
      upsert: false
    });

  if (error) {
    console.error("[uploadStoreItemImage]", error);
    return {
      ok: false,
      error:
        error.message?.includes("Bucket not found") || error.message?.includes("not found")
          ? "Storage bucket missing. Run the store-items migration in Supabase (see CONTEXT.md)."
          : "Upload failed"
    };
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(STORE_ITEMS_BUCKET).getPublicUrl(filename);

  return { ok: true, url: publicUrl };
}
