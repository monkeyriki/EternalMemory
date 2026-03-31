import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { SupabaseSsrCookie } from "@/lib/supabaseSsrCookies";
import { safeAuthRedirectPath } from "@/lib/safeAuthRedirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeAuthRedirectPath(searchParams.get("next"), "/");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: SupabaseSsrCookie[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                options as Parameters<typeof cookieStore.set>[2]
              )
            );
          }
        }
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(origin + next);
    }
  }

  // Recovery links can arrive as token_hash + type=recovery.
  if (tokenHash && type === "recovery") {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: SupabaseSsrCookie[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                options as Parameters<typeof cookieStore.set>[2]
              )
            );
          }
        }
      }
    );
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery"
    });
    if (!error) {
      return NextResponse.redirect(origin + next);
    }
  }

  return NextResponse.redirect(origin + "/auth/login?error=auth");
}
