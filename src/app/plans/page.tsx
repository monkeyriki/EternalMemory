import Link from "next/link";
import { Check, Sparkles, Heart, Infinity } from "lucide-react";
import { Button } from "@/components/Button";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";

export const metadata = {
  title: "Plans & features — EternalMemory",
  description: "Compare Basic, Premium, and Lifetime memorial hosting: gallery size, ads, and billing."
};

const planCards = [
  {
    name: "Basic",
    tagline: "Start at no cost",
    accent: "border-slate-200/90 bg-white/95",
    ring: "",
    icon: Heart,
    price: "Free",
    bullets: [
      "Create and publish a memorial",
      "Up to 5 gallery photos (plus cover)",
      "Platform ads may appear on the public page",
      "Upgrade anytime from edit or upgrade page"
    ],
    cta: { kind: "basic" as const }
  },
  {
    name: "Premium",
    tagline: "More room, ad-free page",
    accent: "border-slate-200/90 bg-white/95",
    ring: "ring-1 ring-slate-200/80",
    icon: Sparkles,
    price: "Subscription",
    bullets: [
      "Up to 24 gallery photos (plus cover)",
      "No platform ads on the public memorial",
      "Monthly or yearly billing — cancel anytime",
      "Great for active tributes and family sharing"
    ],
    cta: { kind: "premium" as const }
  },
  {
    name: "Lifetime",
    tagline: "Pay once for this memorial",
    accent: "border-amber-200/90 bg-amber-50/40",
    ring: "ring-1 ring-amber-200/70",
    icon: Infinity,
    price: "One-time",
    bullets: [
      "Same benefits as Premium, permanently",
      "Up to 24 gallery photos (plus cover)",
      "No platform ads on the public memorial",
      "Ideal when you want zero renewals"
    ],
    cta: { kind: "lifetime" as const }
  }
];

export default function PlansPage() {
  return (
    <MemorialPageShell
      title="Plans & features"
      subtitle="Start free on Basic, or choose Premium or Lifetime for a single memorial. You will sign in if needed, then choose billing options on the next step."
      maxWidth="5xl"
      contentClassName="mt-6 space-y-12"
    >
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/memorials/new">
          <Button variant="accent" className="px-6 py-2.5 text-sm font-semibold">
            Create a memorial
          </Button>
        </Link>
        <Link href="/memorials">
          <Button variant="secondary" className="px-6 py-2.5 text-sm font-semibold">
            Browse memorials
          </Button>
        </Link>
      </div>

      <section aria-labelledby="plans-cards-heading">
        <h2
          id="plans-cards-heading"
          className="text-center font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
        >
          Choose the right fit
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-600 sm:text-base">
          One memorial, one plan. You can change hosting later without losing your page.
        </p>
        <div className="mt-8 grid items-stretch gap-5 md:grid-cols-3">
          {planCards.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`flex h-full min-h-0 flex-col rounded-2xl border p-6 shadow-md shadow-slate-400/10 backdrop-blur ${plan.accent} ${plan.ring}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-xl font-semibold text-slate-900">{plan.name}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{plan.tagline}</p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100/90 text-amber-800 ring-1 ring-amber-200/80">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-amber-800">
                  {plan.price}
                </p>
                <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-2.5 text-sm text-slate-700">
                  {plan.bullets.map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto shrink-0 pt-6">
                  {plan.cta.kind === "basic" && (
                    <Link href="/memorials/new" className="block w-full">
                      <Button
                        variant="secondary"
                        className="w-full py-2.5 text-sm font-semibold"
                      >
                        Create a memorial
                      </Button>
                    </Link>
                  )}
                  {plan.cta.kind === "premium" && (
                    <Link
                      href="/plans/continue-checkout?plan=premium"
                      className="block w-full"
                    >
                      <Button
                        variant="accent"
                        className="w-full py-2.5 text-sm font-semibold"
                      >
                        Subscribe
                      </Button>
                    </Link>
                  )}
                  {plan.cta.kind === "lifetime" && (
                    <Link href="/plans/continue-checkout?plan=lifetime" className="block w-full">
                      <Button
                        variant="accent"
                        className="w-full py-2.5 text-sm font-semibold"
                      >
                        Pay once
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="compare-table-heading" className="space-y-4">
        <h2
          id="compare-table-heading"
          className="text-center font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
        >
          Compare in detail
        </h2>
        <p className="text-center text-sm text-slate-600">
          Quick reference for pricing, gallery limits, ads, and billing.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/95 shadow-md shadow-slate-400/10 backdrop-blur">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="px-4 py-3.5 font-semibold text-slate-900">Feature</th>
                <th className="px-4 py-3.5 font-semibold text-slate-900">Basic</th>
                <th className="px-4 py-3.5 font-semibold text-amber-900/90">Premium</th>
                <th className="px-4 py-3.5 font-semibold text-amber-900/90">Lifetime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="bg-white/80">
                <td className="px-4 py-3 font-medium text-slate-800">Price</td>
                <td className="px-4 py-3">Free</td>
                <td className="px-4 py-3">Subscription (monthly or yearly)</td>
                <td className="px-4 py-3">One-time</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-800">Gallery photos (excl. cover)</td>
                <td className="px-4 py-3">Up to 5</td>
                <td className="px-4 py-3">Up to 24</td>
                <td className="px-4 py-3">Up to 24</td>
              </tr>
              <tr className="bg-white/80">
                <td className="px-4 py-3 font-medium text-slate-800">Platform ads on public page</td>
                <td className="px-4 py-3">Yes (unless manually hidden)</td>
                <td className="px-4 py-3">No</td>
                <td className="px-4 py-3">No</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-800">Billing</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">Renews until cancelled</td>
                <td className="px-4 py-3">Pay once per memorial</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-4 text-center text-sm text-slate-600 shadow-sm backdrop-blur">
        After you publish, you can also open <strong className="text-slate-800">Edit</strong> → hosting, or visit{" "}
        <code className="rounded-md bg-slate-200/70 px-1.5 py-0.5 text-xs text-slate-800">
          /memorials/your-slug/upgrade
        </code>{" "}
        to change plan for that memorial.
      </div>
    </MemorialPageShell>
  );
}
