import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { parseMemorialPlanCheckoutSku } from "@/lib/memorialStripeHosting";
import MemorialNewClient from "./MemorialNewClient";

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

  const nextPath = (() => {
    const params = new URLSearchParams();
    if (firstName) params.set("firstName", firstName);
    if (lastName) params.set("lastName", lastName);
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
      checkoutPlanAfterCreate={checkoutPlanAfterCreate}
    />
  );
}
