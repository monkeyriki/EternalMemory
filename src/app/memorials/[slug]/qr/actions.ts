"use server";

import QRCode from "qrcode";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { SITE_URL_PUBLIC } from "@/lib/site";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL_PUBLIC;

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

  const slugNorm = input.slug.trim().toLowerCase();
  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, slug, owner_id, is_draft")
    .eq("id", input.memorial_id)
    .maybeSingle();

  if (!memorial) {
    return { ok: false, error: "Memorial not found." };
  }

  if (memorial.slug.toLowerCase() !== slugNorm) {
    return { ok: false, error: "Invalid memorial." };
  }

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  const isOwner = !!user && memorial.owner_id === user.id;

  if (memorial.is_draft && !isOwner && !isAdmin) {
    return {
      ok: false,
      error: "QR codes are available after the memorial is published."
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

  if (isOwner || isAdmin) {
    const { error: qrErr } = await supabase.from("qr_codes").upsert(
      {
        memorial_id: input.memorial_id,
        code_value: memorialUrl,
        image_url: dataUrl
      },
      { onConflict: "memorial_id" }
    );
    if (qrErr) {
      console.error("generateQRAction qr_codes upsert:", qrErr);
    }
  }

  return { ok: true, dataUrl };
}
