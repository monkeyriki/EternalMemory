import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import { Button } from "@/components/Button";
import { BulkCreateClient } from "./BulkCreateClient";
import { SubscribeB2BButton } from "./SubscribeB2BButton";

export default async function DashboardB2BPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: activeSub } = await supabase
    .from("b2b_subscriptions")
    .select(
      "status, current_period_end, plan_name, price_cents, currency"
    )
    .eq("account_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!activeSub) {
    return (
      <MemorialPageShell
        title="B2B partner program"
        subtitle="Create and manage bulk memorials for funeral homes, pet crematoriums, and care providers."
        maxWidth="3xl"
        contentClassName="mt-6 space-y-6"
      >
        <Link
          href="/dashboard"
          className="inline-block text-sm font-medium text-amber-800 underline-offset-4 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-md shadow-slate-400/10 backdrop-blur sm:p-8">
          <ul className="list-inside list-disc space-y-2 text-sm text-slate-700">
            <li>Unlimited memorials for your clients (fair use)</li>
            <li>Bulk creation tools</li>
            <li>Dedicated B2B dashboard</li>
          </ul>
          <p className="mt-6 font-serif text-xl font-semibold text-slate-900">$29.99/month</p>
          <div className="mt-4">
            <SubscribeB2BButton />
          </div>
        </div>
      </MemorialPageShell>
    );
  }

  const { data: partnerMemorials } = await supabase
    .from("memorials")
    .select("id, slug, full_name, type, visibility, is_draft, created_at")
    .eq("managed_by_partner_id", user.id)
    .order("created_at", { ascending: false });

  const list = partnerMemorials ?? [];
  const periodEnd = activeSub.current_period_end
    ? new Date(activeSub.current_period_end).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "—";

  return (
    <MemorialPageShell
      title="B2B dashboard"
      subtitle={`Subscription ${activeSub.status} · Renews or ends ${periodEnd}`}
      maxWidth="5xl"
      contentClassName="mt-6 space-y-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-amber-800 underline-offset-4 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <p className="text-xs text-slate-500">
          {activeSub.plan_name} — {(activeSub.price_cents / 100).toFixed(2)}{" "}
          {activeSub.currency?.toUpperCase() ?? "USD"}
        </p>
      </div>

      <BulkCreateClient />

      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-md shadow-slate-400/10 backdrop-blur">
        <h2 className="font-serif text-lg font-semibold text-slate-900">Memorials you manage</h2>
        {list.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No client memorials yet. Use bulk create above.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {list.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm"
              >
                <span className="font-serif font-medium text-slate-900">{m.full_name}</span>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/memorials/${m.slug}`}>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs">
                      View
                    </Button>
                  </Link>
                  <Link href={`/memorials/${m.slug}/edit`}>
                    <Button variant="accent" className="px-3 py-1.5 text-xs">
                      Edit
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MemorialPageShell>
  );
}
