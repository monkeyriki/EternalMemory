"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

const ADMIN_GRANT_FAR_END = "2099-12-31T23:59:59.000Z";

export type AssignB2BResult =
  | { ok: true }
  | { ok: false; error: string };

export async function assignB2BRoleAction(userId: string): Promise<AssignB2BResult> {
  if (!userId?.trim()) {
    return { ok: false, error: "Invalid user." };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Unauthorized." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Admin only." };
  }

  const admin = getSupabaseAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!target) {
    return { ok: false, error: "User not found." };
  }
  if (target.role === "admin") {
    return { ok: false, error: "Cannot change admin role." };
  }

  const syntheticSubId = `admin_grant:${userId}`;
  const now = new Date().toISOString();

  const { error: upErr } = await admin
    .from("profiles")
    .update({ role: "b2b" })
    .eq("id", userId);

  if (upErr) {
    console.error("assignB2BRoleAction profile update:", upErr);
    return { ok: false, error: "Failed to update role." };
  }

  const { error: subErr } = await admin.from("b2b_subscriptions").upsert(
    {
      account_id: userId,
      plan_name: "B2B Monthly (admin grant)",
      price_cents: 0,
      currency: "usd",
      provider: "admin",
      provider_subscription_id: syntheticSubId,
      status: "active",
      current_period_start: now,
      current_period_end: ADMIN_GRANT_FAR_END
    },
    { onConflict: "provider_subscription_id" }
  );

  if (subErr) {
    console.error("assignB2BRoleAction b2b_subscriptions upsert:", subErr);
    return { ok: false, error: "Failed to create subscription row." };
  }

  return { ok: true };
}
