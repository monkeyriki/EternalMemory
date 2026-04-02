import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import {
  MEMORIAL_GATE_COOKIE_NAME,
  memorialGateCookieSerializeOptions,
  signMemorialGateCookie
} from "@/lib/memorialGateCookie";
import { assertIpNotBannedFromHeaders } from "@/lib/ipBanCheck";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const ipBlock = await assertIpNotBannedFromHeaders(req.headers);
  if (!ipBlock.ok) {
    return NextResponse.json({ ok: false, error: ipBlock.error }, { status: 403 });
  }

  const { password } = await req.json();
  const { slug } = await context.params;
  const normalizedSlug = slug.toLowerCase();

  const supabase = getSupabaseAdminClient();

  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, visibility, password_hash")
    .eq("slug", normalizedSlug)
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
    const res = NextResponse.json({ ok: true, token: normalizedSlug }, { status: 200 });
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

