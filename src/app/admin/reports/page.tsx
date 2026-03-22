import { getSupabaseServerClient } from "@/lib/supabaseServer";
import ReportsQueueClient from "./ReportsQueueClient";
import { CONTENT_REPORT_REASON_LABELS, type ContentReportReason } from "@/lib/contentReport";

export type ReportRow = {
  id: string;
  reason: string;
  custom_message: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  memorial_id: string;
  tribute_id: string | null;
  memorial: {
    slug: string;
    full_name: string | null;
    owner_id: string | null;
  } | null;
  tribute: {
    id: string;
    message: string | null;
    guest_name: string | null;
    store_item_id: string | null;
  } | null;
};

export default async function AdminReportsPage() {
  const supabase = await getSupabaseServerClient();

  const { data: rows, error } = await supabase
    .from("content_reports")
    .select(
      `id, reason, custom_message, status, created_at, reviewed_at, reviewed_by, memorial_id, tribute_id,
       memorial:memorial_id ( slug, full_name, owner_id ),
       tribute:tribute_id ( id, message, guest_name, store_item_id )`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[AdminReportsPage]", error);
  }

  function one<T>(v: T | T[] | null | undefined): T | null {
    if (v == null) return null;
    return Array.isArray(v) ? (v[0] ?? null) : v;
  }

  const reports: ReportRow[] = (rows ?? []).map((raw: Record<string, unknown>) => ({
    id: String(raw.id),
    reason: String(raw.reason),
    custom_message:
      raw.custom_message == null ? null : String(raw.custom_message),
    status: String(raw.status),
    created_at: String(raw.created_at),
    reviewed_at:
      raw.reviewed_at == null ? null : String(raw.reviewed_at),
    reviewed_by:
      raw.reviewed_by == null ? null : String(raw.reviewed_by),
    memorial_id: String(raw.memorial_id),
    tribute_id: raw.tribute_id == null ? null : String(raw.tribute_id),
    memorial: one(raw.memorial as ReportRow["memorial"] | ReportRow["memorial"][]),
    tribute: one(raw.tribute as ReportRow["tribute"] | ReportRow["tribute"][])
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Content reports
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        User-submitted flags for memorial pages and guestbook entries. Open reports are listed first.
      </p>

      <div className="mt-6">
        <ReportsQueueClient
          initialReports={reports}
          reasonLabels={CONTENT_REPORT_REASON_LABELS as Record<ContentReportReason, string>}
        />
      </div>
    </div>
  );
}
