/**
 * Cookie entries passed by @supabase/ssr createServerClient via setAll().
 * Explicit typing satisfies strict TypeScript (noImplicitAny) on Vercel builds.
 */
export type SupabaseSsrCookie = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};
