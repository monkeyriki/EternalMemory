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

  const memorialUrl = `${BASE_URL}/memorials/${input.slug}`;

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
