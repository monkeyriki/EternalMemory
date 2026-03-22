"use server";

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { deleteTributeAction } from "@/app/memorials/[slug]/tributes/actions";
import { sendTransactionalEmail } from "@/lib/resendEmail";
import { contentReportOwnerEmail } from "@/lib/emailTemplates";
import { CONTENT_REPORT_REASON_LABELS, type ContentReportReason } from "@/lib/contentReport";
import { requireAdmin } from "@/lib/requireAdmin";
import { deleteMemorialAsAdminAction } from "@/app/admin/memorials/actions";

export type ReportActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function dismissReportAction(reportId: string): Promise<ReportActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const now = new Date().toISOString();
  const { error } = await guard.supabase
    .from("content_reports")
    .update({
      status: "dismissed",
      reviewed_at: now,
      reviewed_by: guard.user.id
    })
    .eq("id", reportId);

  if (error) {
    console.error("[dismissReportAction]", error);
    return { ok: false, error: "Could not update report." };
  }
  return { ok: true };
}

export async function markReportReviewedAction(reportId: string): Promise<ReportActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const now = new Date().toISOString();
  const { error } = await guard.supabase
    .from("content_reports")
    .update({
      status: "reviewed",
      reviewed_at: now,
      reviewed_by: guard.user.id
    })
    .eq("id", reportId);

  if (error) {
    console.error("[markReportReviewedAction]", error);
    return { ok: false, error: "Could not update report." };
  }
  return { ok: true };
}

/** Delete the reported guestbook row and mark the report reviewed. */
export async function removeTributeAndReviewReportAction(
  reportId: string,
  tributeId: string
): Promise<ReportActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const { data: row } = await guard.supabase
    .from("content_reports")
    .select("id, tribute_id")
    .eq("id", reportId)
    .maybeSingle();

  if (!row || row.tribute_id !== tributeId) {
    return { ok: false, error: "Report does not match this tribute." };
  }

  const del = await deleteTributeAction({ id: tributeId });
  if (!del.ok) {
    return { ok: false, error: del.error ?? "Could not remove tribute." };
  }

  const now = new Date().toISOString();
  const { error } = await guard.supabase
    .from("content_reports")
    .update({
      status: "reviewed",
      reviewed_at: now,
      reviewed_by: guard.user.id
    })
    .eq("id", reportId);

  if (error) {
    console.error("[removeTributeAndReviewReportAction] update report", error);
    return { ok: false, error: "Tribute removed but report status failed to update." };
  }

  return { ok: true };
}

/** @deprecated Use deleteMemorialAsAdminAction from @/app/admin/memorials/actions */
export async function removeMemorialAsAdminAction(
  memorialId: string
): Promise<ReportActionResult> {
  return deleteMemorialAsAdminAction(memorialId);
}

export async function notifyOwnerAboutReportAction(reportId: string): Promise<ReportActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok || !guard.user) return { ok: false, error: guard.error };

  const { data: report } = await guard.supabase
    .from("content_reports")
    .select(
      "id, reason, custom_message, memorial_id, tribute_id, memorial:memorial_id ( slug, full_name, owner_id )"
    )
    .eq("id", reportId)
    .maybeSingle();

  const memorial = report?.memorial as
    | { slug: string; full_name: string | null; owner_id: string | null }
    | null
    | undefined;

  if (!report || !memorial?.owner_id) {
    return { ok: false, error: "Report or memorial owner not found." };
  }

  const reasonKey = report.reason as ContentReportReason;
  const reasonLabel =
    CONTENT_REPORT_REASON_LABELS[reasonKey] ?? String(report.reason ?? "Other");

  const admin = getSupabaseAdminClient();
  const { data: ownerAuth, error: ownerErr } = await admin.auth.admin.getUserById(
    memorial.owner_id
  );

  const ownerEmailRaw = ownerAuth?.user?.email?.trim();
  if (ownerErr || !ownerEmailRaw || !ownerAuth?.user) {
    return { ok: false, error: "Could not load owner email." };
  }

  const ownerUser = ownerAuth.user;
  const meta = ownerUser.user_metadata as { full_name?: string } | undefined;
  const ownerName =
    meta?.full_name?.trim() || ownerUser.email?.split("@")[0] || "there";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://eternalmemory.app";
  const isTribute = !!report.tribute_id;
  const snippet =
    typeof report.custom_message === "string" && report.custom_message.trim()
      ? report.custom_message.trim().slice(0, 500)
      : null;

  const content = contentReportOwnerEmail({
    ownerName,
    memorialName: memorial.full_name?.trim() || "Memorial",
    memorialSlug: memorial.slug,
    reasonLabel,
    isTributeReport: isTribute,
    reporterNote: snippet,
    appUrl
  });

  const send = await sendTransactionalEmail({
    to: ownerEmailRaw,
    subject: content.subject,
    html: content.html,
    text: content.text
  });

  if (!send.ok && !send.skipped) {
    return { ok: false, error: send.error || "Email failed." };
  }

  return { ok: true };
}
