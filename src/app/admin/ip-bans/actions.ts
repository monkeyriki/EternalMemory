"use server";

import { requireAdmin } from "@/lib/requireAdmin";

export type IpBanActionResult =
  | { ok: true }
  | { ok: false; error: string };

/** Normalize user input to a Postgres cidr (single IP → /32 or /128). */
function normalizeCidrInput(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (s.includes("/")) return s;
  if (s.includes(":")) return `${s}/128`;
  return `${s}/32`;
}

export async function addIpBanAction(input: {
  cidr: string;
  reason?: string | null;
  /** ISO date string or empty for permanent */
  expiresAt?: string | null;
}): Promise<IpBanActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const cidr = normalizeCidrInput(input.cidr);
  if (!cidr) return { ok: false, error: "Enter an IP address or CIDR." };

  const reason =
    typeof input.reason === "string" ? input.reason.trim().slice(0, 500) : null;
  let expiresAt: string | null = null;
  if (input.expiresAt?.trim()) {
    const d = new Date(input.expiresAt);
    if (Number.isNaN(d.getTime())) {
      return { ok: false, error: "Invalid expiry date." };
    }
    expiresAt = d.toISOString();
  }

  const { error } = await guard.supabase.from("ip_bans").insert({
    cidr,
    reason: reason || null,
    created_by: guard.user.id,
    expires_at: expiresAt
  });

  if (error) {
    console.error("[addIpBanAction]", error);
    return {
      ok: false,
      error:
        "Could not add ban. Use a valid IPv4/IPv6 address or CIDR (e.g. 203.0.113.5 or 10.0.0.0/24)."
    };
  }
  return { ok: true };
}

export async function removeIpBanAction(banId: string): Promise<IpBanActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const id = banId?.trim();
  if (!id) return { ok: false, error: "Invalid ban." };

  const { error } = await guard.supabase.from("ip_bans").delete().eq("id", id);

  if (error) {
    console.error("[removeIpBanAction]", error);
    return { ok: false, error: "Could not remove ban." };
  }
  return { ok: true };
}
