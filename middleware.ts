import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseSsrCookie } from "@/lib/supabaseSsrCookies";
import { getClientIpFromHeaders } from "@/lib/clientIp";
import { shouldSkipIpBanForRequest } from "@/lib/ipBanSkip";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: SupabaseSsrCookie[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(
                name,
                value,
                options as Parameters<typeof response.cookies.set>[2]
              )
            );
          } catch {
            // Ignore (same pattern as cookie store in Server Components)
          }
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const clientIp = getClientIpFromHeaders(request.headers);
  if (clientIp) {
    const skip = await shouldSkipIpBanForRequest(supabase, clientIp, user);
    if (!skip) {
      const { data: banned, error: banErr } = await supabase.rpc(
        "is_ip_address_banned",
        { check_ip: clientIp }
      );
      if (!banErr && banned === true) {
        return new NextResponse(
          "Access denied. If you believe this is a mistake, contact support.",
          {
            status: 403,
            headers: { "content-type": "text/plain; charset=utf-8" }
          }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
