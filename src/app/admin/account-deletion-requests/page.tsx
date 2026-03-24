import { getSupabaseServerClient } from "@/lib/supabaseServer";
import AccountDeletionRequestsClient, {
  type AccountDeletionRequestRow
} from "./AccountDeletionRequestsClient";

export default async function AdminAccountDeletionRequestsPage() {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await (supabase as any)
    .from("account_deletion_requests")
    .select(
      "id, user_id, email, reason, status, requested_at, processed_at, admin_note"
    )
    .order("requested_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
          Account deletion requests
        </h1>
        <p className="text-sm text-red-600">Failed to load deletion requests.</p>
      </div>
    );
  }

  const rows: AccountDeletionRequestRow[] = (data ?? []).map((r: any) => ({
    id: String(r.id),
    user_id: String(r.user_id),
    email: r.email,
    reason: r.reason,
    status: r.status as AccountDeletionRequestRow["status"],
    requested_at: String(r.requested_at),
    processed_at: r.processed_at,
    admin_note: r.admin_note
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
        Account deletion requests
      </h1>
      <p className="text-sm text-slate-600">
        Review and process GDPR/CCPA deletion requests. Use status updates and
        admin notes to track decisions.
      </p>
      <AccountDeletionRequestsClient initialRows={rows} />
    </div>
  );
}
