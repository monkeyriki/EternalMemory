import Link from "next/link";
import { Check, Sparkles, Heart, Infinity } from "lucide-react";
import { Button } from "@/components/Button";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";

type CompareCell =
  | { kind: "check" }
  | { kind: "text"; value: string }
  | { kind: "muted"; value: string };

const compareRows: Array<{
  title: string;
  description: string;
  basic: CompareCell;
  premium: CompareCell;
  lifetime: CompareCell;
}> = [
  {
    title: "Memorial page",
    description:
      "Create and publish a respectful page with story, photos, guestbook, and sharing.",
    basic: { kind: "check" },
    premium: { kind: "check" },
    lifetime: { kind: "check" }
  },
  {
    title: "Photo gallery",
    description: "Gallery images in addition to the cover (per memorial, hosting limits apply).",
    basic: { kind: "text", value: "5" },
    premium: { kind: "text", value: "24" },
    lifetime: { kind: "text", value: "24" }
  },
  {
    title: "Platform ads",
    description:
      "Third-party ads on the public page when enabled for the site. Paid plans hide ads on your memorial.",
    basic: { kind: "muted", value: "May apply" },
    premium: { kind: "check" },
    lifetime: { kind: "check" }
  },
  {
    title: "Price & billing",
    description: "How hosting is billed for this memorial.",
    basic: { kind: "text", value: "Free" },
    premium: { kind: "muted", value: "Monthly or yearly" },
    lifetime: { kind: "muted", value: "Pay once" }
  }
];

function CompareCellIcon({
  cell,
  tone
}: {
  cell: CompareCell;
  tone: "basic" | "premium" | "lifetime";
}) {
  const checkClass =
    tone === "basic"
      ? "text-slate-400"
      : tone === "premium"
        ? "text-teal-600"
        : "text-amber-700";

  if (cell.kind === "check") {
    return (
      <div className="flex min-h-[2.5rem] items-center justify-center sm:min-h-0">
        <span className="sr-only">Included</span>
        <Check className={`h-5 w-5 ${checkClass}`} strokeWidth={2} aria-hidden />
      </div>
    );
  }
  const textClass =
    tone === "basic"
      ? "text-slate-500"
      : tone === "premium"
        ? "text-teal-700"
        : "text-amber-800";
  const muted = cell.kind === "muted";
  return (
    <div className="flex min-h-[2.5rem] items-center justify-center sm:min-h-0">
      <p
        className={`text-center text-xs font-semibold uppercase tracking-wide sm:text-sm ${
          muted ? "text-slate-500" : textClass
        }`}
      >
        {cell.value}
      </p>
    </div>
  );
}

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

      <section aria-labelledby="compare-table-heading" className="space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Website features
          </p>
          <h2
            id="compare-table-heading"
            className="mt-2 font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Compare in detail
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
            Quick reference for pricing, gallery limits, ads, and billing.
          </p>
        </div>

        <div className="-mx-4 overflow-x-auto rounded-3xl bg-slate-50/80 px-4 py-6 sm:mx-0 sm:px-8 sm:py-10">
          <div className="mx-auto w-full max-w-4xl min-w-[640px]">
            {/* Column headers — competitor-style uppercase, color per tier */}
            <div className="grid grid-cols-[minmax(0,1.45fr)_repeat(3,minmax(0,1fr))] gap-4 border-b border-slate-200/80 pb-6 sm:gap-6">
              <div aria-hidden className="min-w-0" />
              <div className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 sm:text-xs">
                Basic
              </div>
              <div className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800 sm:text-xs">
                Premium
              </div>
              <div className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-amber-900 sm:text-xs">
                Lifetime
              </div>
            </div>

            <div className="divide-y divide-slate-200/60">
              {compareRows.map((row) => (
                <div
                  key={row.title}
                  className="grid grid-cols-[minmax(0,1.45fr)_repeat(3,minmax(0,1fr))] items-center gap-4 py-7 sm:gap-6"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold leading-snug text-slate-900">{row.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{row.description}</p>
                  </div>
                  <CompareCellIcon cell={row.basic} tone="basic" />
                  <CompareCellIcon cell={row.premium} tone="premium" />
                  <CompareCellIcon cell={row.lifetime} tone="lifetime" />
                </div>
              ))}
            </div>

            <div className="mt-2 border-t border-slate-200/80 pt-8">
              <div className="grid grid-cols-[minmax(0,1.45fr)_repeat(3,minmax(0,1fr))] items-end gap-4 sm:gap-6">
                <div aria-hidden className="min-w-0" />
                <div className="flex flex-col items-center gap-3 px-0.5">
                  <p className="text-center text-sm font-semibold text-slate-600">Free</p>
                  <Link
                    href="/memorials/new"
                    className="block w-full max-w-[200px] rounded-xl bg-slate-500 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  >
                    Select
                  </Link>
                </div>
                <div className="flex flex-col items-center gap-3 px-0.5">
                  <p className="text-center text-sm font-semibold text-teal-800">Subscription</p>
                  <Link
                    href="/plans/continue-checkout?plan=premium"
                    className="block w-full max-w-[200px] rounded-xl bg-teal-700 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  >
                    Select
                  </Link>
                </div>
                <div className="flex flex-col items-center gap-3 px-0.5">
                  <p className="text-center text-sm font-semibold text-amber-900">One-time</p>
                  <Link
                    href="/plans/continue-checkout?plan=lifetime"
                    className="block w-full max-w-[200px] rounded-xl bg-amber-800 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                  >
                    Select
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MemorialPageShell>
  );
}
