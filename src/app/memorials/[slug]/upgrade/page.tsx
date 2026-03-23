import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
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

  if (!isOwner && !isAdmin) {
    redirect(`/memorials/${slug}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Memorial hosting
          </h1>
          <Link
            href={`/memorials/${slug}/edit`}
            className="text-sm font-medium text-sky-700 underline underline-offset-2"
          >
            Back to edit
          </Link>
        </div>
        <UpgradeMemorialClient
          memorialId={memorial.id}
          slug={memorial.slug}
          fullName={memorial.full_name}
          hostingPlan={memorial.hosting_plan as string | null}
          planExpiresAt={memorial.plan_expires_at}
          checkout={checkout}
        />
      </div>
    </div>
  );
}
