import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  MEMORIAL_GATE_COOKIE_NAME,
  verifyMemorialGateCookie
} from "@/lib/memorialGateCookie";

const GATE_ERROR =
  "This memorial is password protected. Open the page and enter the password first.";

/**
 * PRD: password memorials require PIN/password to leave a tribute (and paid checkout).
 * Owner and platform admin are always allowed.
 */
export async function assertPasswordMemorialInteractionAllowed(
  memorialId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, visibility, owner_id")
    .eq("id", memorialId)
    .maybeSingle();

  if (!memorial) {
    return { ok: false, error: "Memorial not found." };
  }

  if (memorial.visibility !== "password_protected") {
    return { ok: true };
  }

  if (user && memorial.owner_id === user.id) {
    return { ok: true };
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "admin") {
      return { ok: true };
    }
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(MEMORIAL_GATE_COOKIE_NAME)?.value;
  if (!verifyMemorialGateCookie(raw, memorial.id)) {
    return { ok: false, error: GATE_ERROR };
  }

  return { ok: true };
}
