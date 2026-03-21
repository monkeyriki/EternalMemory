import { createHmac, timingSafeEqual } from "crypto";

/** HttpOnly cookie set after successful memorial password verification (PRD: gate tributes & checkout). */
export const MEMORIAL_GATE_COOKIE_NAME = "em_memorial_gate";

const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Buffer {
  const env = process.env.MEMORIAL_GATE_SECRET?.trim();
  if (env && env.length >= 16) {
    return Buffer.from(env, "utf8");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "MEMORIAL_GATE_SECRET must be set (min 16 characters) in production."
    );
  }
  return Buffer.from("dev-em-memorial-gate-secret-min-16", "utf8");
}

export function signMemorialGateCookie(memorialId: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = Buffer.from(
    JSON.stringify({ mid: memorialId, exp }),
    "utf8"
  ).toString("base64url");
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyMemorialGateCookie(
  token: string | undefined,
  memorialId: string
): boolean {
  if (!token || !memorialId) return false;
  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length) return false;
  try {
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  let data: { mid?: string; exp?: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return false;
  }
  if (data.mid !== memorialId) return false;
  if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) {
    return false;
  }
  return true;
}

export const memorialGateCookieMaxAgeSeconds = MAX_AGE_SEC;

export function memorialGateCookieSerializeOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/" as const,
    maxAge: MAX_AGE_SEC
  };
}
