import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let adminClient: SupabaseClient<Database> | undefined;

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

    adminClient = createClient<Database>(url, serviceKey, {
      auth: { persistSession: false }
    });
  }
  return adminClient;
}

