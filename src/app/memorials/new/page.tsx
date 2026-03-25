import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { parseMemorialPlanCheckoutSku } from "@/lib/memorialStripeHosting";
import type { PlansTier } from "@/lib/plansTier";
import MemorialNewClient from "./MemorialNewClient";

function parseHostingParam(raw: string | string[] | undefined): PlansTier | null {
  const s = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  if (s === "premium" || s === "lifetime") return s;
  return null;
}

export const metadata = {
  title: "Create memorial | EternalMemory",
  description: "Create a new digital memorial"
};

export default async function MemorialNewPage({
  searchParams
}: {
  searchParams?: {
    firstName?: string | string[];
    lastName?: string | string[];
    checkoutPlan?: string | string[];
    hosting?: string | string[];
  };
}) {
  const firstNameRaw = searchParams?.firstName;
  const lastNameRaw = searchParams?.lastName;
  const firstName =
    (Array.isArray(firstNameRaw) ? firstNameRaw[0] : firstNameRaw)?.trim() ??
    "";
  const lastName =
    (Array.isArray(lastNameRaw) ? lastNameRaw[0] : lastNameRaw)?.trim() ?? "";
  const prefillFullName = [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const checkoutPlanRaw = searchParams?.checkoutPlan;
  const checkoutPlanStr =
    typeof checkoutPlanRaw === "string"
      ? checkoutPlanRaw
      : Array.isArray(checkoutPlanRaw)
        ? checkoutPlanRaw[0]
        : "";
  const checkoutPlanAfterCreate = parseMemorialPlanCheckoutSku(checkoutPlanStr);
  const hostingAfterCreate = parseHostingParam(searchParams?.hosting);

  const nextPath = (() => {
    const params = new URLSearchParams();
    if (firstName) params.set("firstName", firstName);
    if (lastName) params.set("lastName", lastName);
    if (hostingAfterCreate) {
      params.set("hosting", hostingAfterCreate);
    }
    if (checkoutPlanAfterCreate) {
      params.set("checkoutPlan", checkoutPlanAfterCreate);
    }
    const qs = params.toString();
    return qs ? `/memorials/new?${qs}` : "/memorials/new";
  })();

  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <MemorialNewClient
      initialFullName={prefillFullName}
      hostingAfterCreate={hostingAfterCreate}
      checkoutPlanAfterCreate={checkoutPlanAfterCreate}
    />
  );
}
