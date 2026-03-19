import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseSsrCookie } from "@/lib/supabaseSsrCookies";

export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: SupabaseSsrCookie[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                options as Parameters<typeof cookieStore.set>[2]
              )
            );
          } catch {
            // Ignore in Server Component (e.g. during redirect)
          }
        }
      }
    }
  );
}
