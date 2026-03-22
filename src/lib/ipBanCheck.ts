import { headers } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getClientIpFromHeaders } from "@/lib/clientIp";
import { shouldSkipIpBanForRequest } from "@/lib/ipBanSkip";

export { getClientIpFromHeaders } from "@/lib/clientIp";

export async function isIpAddressBannedRpc(checkIp: string): Promise<boolean> {
  const ip = checkIp.trim();
  if (!ip) return false;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (await shouldSkipIpBanForRequest(supabase, ip, user)) {
    return false;
  }

  const { data, error } = await supabase.rpc("is_ip_address_banned", {
    check_ip: ip
  });

  if (error) {
    console.error("[isIpAddressBannedRpc]", error);
    return false;
  }

  return data === true;
}

/** For Server Actions / Server Components (uses Next `headers()`). */
export async function assertIpNotBanned(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  if (!ip) return { ok: true };

  if (await shouldSkipIpBanForRequest(supabase, ip, user)) {
    return { ok: true };
  }

  const { data, error } = await supabase.rpc("is_ip_address_banned", {
    check_ip: ip
  });

  if (error) {
    console.error("[assertIpNotBanned]", error);
    return { ok: true };
  }

  if (data === true) {
    return {
      ok: false,
      error: "Access denied."
    };
  }
  return { ok: true };
}

/** For Route Handlers: pass `request.headers`. */
export async function assertIpNotBannedFromHeaders(
  h: Headers
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const ip = getClientIpFromHeaders(h);
  if (!ip) return { ok: true };

  if (await shouldSkipIpBanForRequest(supabase, ip, user)) {
    return { ok: true };
  }

  const { data, error } = await supabase.rpc("is_ip_address_banned", {
    check_ip: ip
  });

  if (error) {
    console.error("[assertIpNotBannedFromHeaders]", error);
    return { ok: true };
  }

  if (data === true) {
    return { ok: false, error: "Access denied." };
  }
  return { ok: true };
}
