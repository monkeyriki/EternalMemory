import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import { parseMemorialPlanCheckoutSku } from "@/lib/memorialStripeHosting";
import UpgradeMemorialClient from "./UpgradeMemorialClient";

export default async function MemorialUpgradePage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const slug = params.slug.toLowerCase();
  const checkoutRaw = searchParams?.checkout;
  const checkout =
    typeof checkoutRaw === "string"
      ? checkoutRaw
      : Array.isArray(checkoutRaw)
        ? checkoutRaw[0]
        : null;

  const autoCheckoutRaw = searchParams?.autoCheckout;
  const autoCheckoutParam =
    typeof autoCheckoutRaw === "string"
      ? autoCheckoutRaw
      : Array.isArray(autoCheckoutRaw)
        ? autoCheckoutRaw[0]
        : null;

  const { data: memorial } = await supabase
    .from("memorials")
    .select("id, slug, owner_id, full_name, hosting_plan, plan_expires_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!memorial) {
    return notFound();
  }

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  const isOwner = !!user && memorial.owner_id === user.id;
  const isAdmin = role === "admin";

  if (!user) {
    const autoCheckoutParsed = parseMemorialPlanCheckoutSku(autoCheckoutParam);
    const qs = new URLSearchParams();
    if (checkout) qs.set("checkout", checkout);
    if (autoCheckoutParsed) qs.set("autoCheckout", autoCheckoutParsed);
    const q = qs.toString();
    const upgradePath = `/memorials/${slug}/upgrade${q ? `?${q}` : ""}`;
    redirect(`/auth/login?next=${encodeURIComponent(upgradePath)}`);
  }

  if (!isOwner && !isAdmin) {
    redirect(`/memorials/${slug}`);
  }

  return (
    <MemorialPageShell
      title="Memorial hosting"
      subtitle="Upgrade gallery limits and remove platform ads for this memorial."
      maxWidth="5xl"
      contentClassName="mt-6"
    >
      <div className="mb-6 flex justify-end">
        <Link
          href={`/memorials/${slug}/edit`}
          className="text-sm font-medium text-amber-800 underline-offset-4 hover:underline"
        >
          ← Back to edit
        </Link>
      </div>
      <UpgradeMemorialClient
        memorialId={memorial.id}
        slug={memorial.slug}
        fullName={memorial.full_name}
        hostingPlan={memorial.hosting_plan as string | null}
        planExpiresAt={memorial.plan_expires_at}
        checkout={checkout}
        autoCheckout={parseMemorialPlanCheckoutSku(autoCheckoutParam ?? null)}
      />
    </MemorialPageShell>
  );
}
