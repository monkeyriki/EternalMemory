import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import AdsAdminClient from "./AdsAdminClient";

export default async function AdminAdsPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/ads");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const [{ data: slots }, { data: adsSetting }] = await Promise.all([
    supabase
      .from("ad_slots")
      .select("id, slot_key, adsense_code, is_active, description")
      .order("slot_key", { ascending: true }),
    supabase.from("platform_settings").select("value").eq("key", "ads_enabled").maybeSingle()
  ]);

  const adsEnabledInitial = String(adsSetting?.value ?? "")
    .trim()
    .toLowerCase();
  const adsOn =
    adsEnabledInitial === "true" ||
    adsEnabledInitial === "1" ||
    adsEnabledInitial === "yes";

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Ads</h1>
      <p className="mt-2 text-sm text-slate-600">
        Google AdSense (or similar) in fixed slots on memorial pages. Premium memorials skip ads
        when &quot;Premium memorial (no ads)&quot; is set on the memorial.
      </p>
      <div className="mt-6">
        <AdsAdminClient initialSlots={(slots ?? []) as any} adsEnabledInitial={adsOn} />
      </div>
    </div>
  );
}
