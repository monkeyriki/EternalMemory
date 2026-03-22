"use server";

import QRCode from "qrcode";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://eternalmemory.app";

type GenerateQRInput = {
  memorial_id: string;
  slug: string;
};

type GenerateQRResult = {
  ok: boolean;
  dataUrl?: string;
  error?: string;
};

export async function generateQRAction(
  input: GenerateQRInput
): Promise<GenerateQRResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const slugNorm = input.slug.trim().toLowerCase();
  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, slug, owner_id")
    .eq("id", input.memorial_id)
    .maybeSingle();

  if (!memorial) {
    return { ok: false, error: "Memorial not found." };
  }

  if (memorial.slug.toLowerCase() !== slugNorm) {
    return { ok: false, error: "Invalid memorial." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";
  const isOwner = memorial.owner_id === user.id;

  if (!isOwner && !isAdmin) {
    return {
      ok: false,
      error: "You do not have permission to generate this QR code."
    };
  }

  const memorialUrl = `${BASE_URL}/memorials/${slugNorm}`;

  let dataUrl: string;
  try {
    dataUrl = await QRCode.toDataURL(memorialUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#1e293b", light: "#ffffff" }
    });
  } catch (err) {
    return { ok: false, error: "Failed to generate QR code." };
  }

  await supabase.from("qr_codes").upsert(
    {
      memorial_id: input.memorial_id,
      code_value: memorialUrl,
      image_url: dataUrl
    },
    { onConflict: "memorial_id" }
  );

  return { ok: true, dataUrl };
}
