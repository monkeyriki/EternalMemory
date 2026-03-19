import { getSupabaseServerClient } from "@/lib/supabaseServer";
import ModerationClient from "./ModerationClient";

export default async function AdminModerationPage() {
  const supabase = await getSupabaseServerClient();

  const { data: allTributes } = await supabase
    .from("virtual_tributes")
    .select("id, message, created_at, guest_name, is_approved, memorial:memorial_id ( slug, full_name )")
    .order("created_at", { ascending: false })
    .limit(100);

  const tributes = (allTributes ?? []) as any[];
  const pending = tributes.filter((t: { is_approved: boolean }) => t.is_approved === false);
  const approved = tributes.filter((t: { is_approved: boolean }) => t.is_approved !== false);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Moderation
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Review and remove recent tributes. Approve pending guest tributes.
      </p>

      <div className="mt-6">
        <ModerationClient pending={pending} approved={approved} />
      </div>
    </div>
  );
}
