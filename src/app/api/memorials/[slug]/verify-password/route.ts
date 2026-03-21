import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  MEMORIAL_GATE_COOKIE_NAME,
  memorialGateCookieSerializeOptions,
  signMemorialGateCookie
} from "@/lib/memorialGateCookie";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { password } = await req.json();
  const slug = params.slug.toLowerCase();

  const supabase = await getSupabaseServerClient();

  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, visibility, password_hash")
    .eq("slug", slug)
    .maybeSingle();

  if (!memorial || memorial.visibility !== "password_protected") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  if (!password || !memorial.password_hash) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const match = await bcrypt.compare(password, memorial.password_hash);
  if (!match) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const gate = signMemorialGateCookie(memorial.id);
    const res = NextResponse.json({ ok: true, token: slug }, { status: 200 });
    res.cookies.set(
      MEMORIAL_GATE_COOKIE_NAME,
      gate,
      memorialGateCookieSerializeOptions()
    );
    return res;
  } catch (e) {
    console.error("[verify-password] gate cookie signing failed:", e);
    return NextResponse.json(
      { ok: false, error: "Server configuration error." },
      { status: 500 }
    );
  }
}

