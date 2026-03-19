import { getSupabaseServerClient } from "@/lib/supabaseServer";
import StoreAdmin from "./StoreAdmin";

export default async function AdminStorePage() {
  const supabase = await getSupabaseServerClient();
  const { data: items } = await supabase
    .from("store_items")
    .select(
      "id, name, description, category, price_cents, currency, image_url, is_premium, is_active, created_at"
    )
    .order("created_at", { ascending: false });

  return <StoreAdmin initialItems={(items ?? []) as any} />;
}
