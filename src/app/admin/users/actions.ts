"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

const ADMIN_GRANT_FAR_END = "2099-12-31T23:59:59.000Z";
const ADMIN_GRANT_PLAN = "B2B Monthly (admin grant)";
const ADMIN_PROVIDER = "admin";

export type UpdateUserRoleResult =
  | { ok: true }
  | { ok: false; error: string };

type AppRole = "user" | "b2b" | "admin";

async function ensureAdminGrantSubscription(userId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  const syntheticSubId = `admin_grant:${userId}`;
  const now = new Date().toISOString();

  const { data: existing, error: selErr } = await admin
    .from("b2b_subscriptions")
    .select("id")
    .eq("provider_subscription_id", syntheticSubId)
    .limit(1)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing?.id) {
    const { error: updErr } = await admin
      .from("b2b_subscriptions")
      .update({
        status: "active",
        current_period_start: now,
        current_period_end: ADMIN_GRANT_FAR_END
      })
      .eq("id", existing.id);
    if (updErr) throw updErr;
    return;
  }

  const { error: insErr } = await admin.from("b2b_subscriptions").insert({
    account_id: userId,
    plan_name: ADMIN_GRANT_PLAN,
    price_cents: 0,
    currency: "usd",
    provider: ADMIN_PROVIDER,
    provider_subscription_id: syntheticSubId,
    status: "active",
    current_period_start: now,
    current_period_end: ADMIN_GRANT_FAR_END
  });
  if (insErr) throw insErr;
}

async function deactivateAdminGrantSubscription(userId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error } = await admin
    .from("b2b_subscriptions")
    .update({
      status: "canceled",
      current_period_end: now
    })
    .eq("account_id", userId)
    .eq("provider", ADMIN_PROVIDER)
    .eq("status", "active");
  if (error) throw error;
}

export async function updateUserRoleAction(
  userId: string,
  nextRole: AppRole
): Promise<UpdateUserRoleResult> {
  if (!userId?.trim()) return { ok: false, error: "Invalid user." };
  if (!["user", "b2b", "admin"].includes(nextRole)) {
    return { ok: false, error: "Invalid role." };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Unauthorized." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return { ok: false, error: "Admin only." };

  if (user.id === userId) {
    return {
      ok: false,
      error: "You cannot change your own role from this screen."
    };
  }

  const admin = getSupabaseAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!target) return { ok: false, error: "User not found." };
  const targetRole = (target as { role: AppRole }).role;
  if (targetRole === nextRole) return { ok: true };

  const { error: upErr } = await admin
    .from("profiles")
    .update({ role: nextRole })
    .eq("id", userId);

  if (upErr) {
    console.error("updateUserRoleAction profile update:", upErr);
    return { ok: false, error: "Failed to update role." };
  }

  try {
    if (nextRole === "b2b") {
      await ensureAdminGrantSubscription(userId);
    } else if (targetRole === "b2b") {
      await deactivateAdminGrantSubscription(userId);
    }
  } catch (e) {
    console.error("updateUserRoleAction b2b_subscriptions sync:", e);
    return { ok: false, error: "Role updated, but subscription sync failed." };
  }

  return { ok: true };
}
