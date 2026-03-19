import { getSupabaseServerClient } from "@/lib/supabaseServer";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: settings } = await supabase
    .from("platform_settings")
    .select("id, key, value")
    .order("key", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Platform settings
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Manage global configuration values.
      </p>

      <div className="mt-6">
        <SettingsClient initial={(settings ?? []) as any} />
      </div>
    </div>
  );
}
