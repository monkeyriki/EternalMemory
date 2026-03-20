import { createClient } from "@supabase/supabase-js";

let adminClient:
  | ReturnType<typeof createClient>
  | undefined;

export function getSupabaseAdminClient() {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false }
    });
  }
  return adminClient;
}

