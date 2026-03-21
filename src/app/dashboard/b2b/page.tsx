import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
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
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Link
            href="/dashboard"
            className="text-sm text-amber-700 hover:underline"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            B2B Partner Program
          </h1>
          <p className="mt-2 text-slate-600">
            Create and manage bulk memorials for your clients — funeral homes,
            pet crematoriums, and care providers.
          </p>
          <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-slate-700">
            <li>Unlimited memorials for your clients (fair use)</li>
            <li>Bulk creation tools</li>
            <li>Dedicated B2B dashboard</li>
          </ul>
          <p className="mt-6 text-lg font-semibold text-slate-900">
            $29.99/month
          </p>
          <div className="mt-4">
            <SubscribeB2BButton />
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-amber-700 hover:underline"
            >
              ← Back to dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              B2B dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Subscription:{" "}
              <span className="font-medium capitalize text-green-700">
                {activeSub.status}
              </span>
              {" · "}
              Renews / ends: {periodEnd}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {activeSub.plan_name} —{" "}
              {(activeSub.price_cents / 100).toFixed(2)}{" "}
              {activeSub.currency?.toUpperCase() ?? "USD"}
            </p>
          </div>
        </div>

        <BulkCreateClient />

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Memorials you manage
          </h2>
          {list.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No client memorials yet. Use bulk create above.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {list.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <span className="font-medium text-slate-900">
                    {m.full_name}
                  </span>
                  <div className="flex gap-3">
                    <Link
                      href={`/memorials/${m.slug}`}
                      className="text-amber-700 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/memorials/${m.slug}/edit`}
                      className="text-amber-700 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
