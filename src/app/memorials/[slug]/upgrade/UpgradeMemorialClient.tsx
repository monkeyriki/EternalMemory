"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getEffectiveHostingPlan,
  memorialPaidHostingActive,
  type MemorialHostingPlan
} from "@/lib/memorialHostingPlan";
import type { MemorialPlanCheckoutSku } from "@/lib/memorialStripeHosting";

/** Temporary: show raw API response for checkout errors. Set to false after debugging. */
const SHOW_CHECKOUT_DEBUG_UI = true;

type UpgradeMemorialClientProps = {
  memorialId: string;
  slug: string;
  fullName: string;
  hostingPlan: string | null;
  planExpiresAt: string | null;
  checkout?: string | null;
  /** From /plans flow: open hosted checkout once on load. */
  autoCheckout?: MemorialPlanCheckoutSku | null;
};

function planLabel(p: MemorialHostingPlan): string {
  if (p === "lifetime") return "Lifetime";
  if (p === "premium") return "Premium";
  return "Basic";
}

export default function UpgradeMemorialClient({
  memorialId,
  slug,
  fullName,
  hostingPlan,
  planExpiresAt,
  checkout,
  autoCheckout = null
}: UpgradeMemorialClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [loadingSku, setLoadingSku] = useState<string | null>(null);
  const [checkoutDebugDetails, setCheckoutDebugDetails] = useState<string | null>(null);
  const [showCheckoutDebug, setShowCheckoutDebug] = useState(false);
  const autoCheckoutStarted = useRef(false);

  const effective = getEffectiveHostingPlan({
    hosting_plan: hostingPlan,
    plan_expires_at: planExpiresAt
  });
  const paidActive = memorialPaidHostingActive({
    hosting_plan: hostingPlan,
    plan_expires_at: planExpiresAt
  });

  const startCheckout = useCallback(async (plan: MemorialPlanCheckoutSku) => {
    setError(null);
    setCheckoutDebugDetails(null);
    setShowCheckoutDebug(false);
    setLoadingSku(plan);
    try {
      const res = await fetch("/api/stripe/memorial-plan-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorial_id: memorialId,
          memorial_slug: slug,
          plan
        })
      });
      let data: { ok?: boolean; url?: string; error?: string } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        data = { error: "Response was not valid JSON." };
      }
      if (!res.ok || !data.ok || !data.url) {
        setError(data.error ?? "Checkout could not be started.");
        setCheckoutDebugDetails(
          JSON.stringify(
            {
              httpStatus: res.status,
              plan,
              responseBody: data
            },
            null,
            2
          )
        );
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setError("Network error. Please try again.");
      setCheckoutDebugDetails(
        JSON.stringify(
          { plan, caught: e instanceof Error ? e.message : String(e) },
          null,
          2
        )
      );
    } finally {
      setLoadingSku(null);
    }
  }, [memorialId, slug]);

  useEffect(() => {
    if (!autoCheckout || autoCheckoutStarted.current) return;
    autoCheckoutStarted.current = true;
    void startCheckout(autoCheckout);
  }, [autoCheckout, startCheckout]);

  const expiresDisplay =
    effective === "premium" && planExpiresAt
      ? new Date(planExpiresAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      : null;

  return (
    <div className="space-y-8">
      {checkout === "success" && (
        <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/95 px-4 py-3 text-sm text-emerald-900 shadow-sm backdrop-blur">
          Payment received. Your memorial plan updates in a few moments once payment is confirmed.
          Refresh this page if it does not change.
        </div>
      )}
      {checkout === "cancelled" && (
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-sm backdrop-blur">
          Checkout was cancelled. You can choose a plan again whenever you are ready.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-md shadow-slate-400/10 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Memorial</p>
        <p className="mt-1 font-serif text-xl font-semibold text-slate-900">{fullName}</p>
        <p className="mt-2 text-sm text-slate-600">
          Current plan:{" "}
          <span className="font-medium text-slate-800">{planLabel(effective)}</span>
          {expiresDisplay ? (
            <span className="text-slate-500"> — renews or ends on {expiresDisplay}</span>
          ) : null}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          <Link href={`/memorials/${slug}`} className="font-medium text-amber-800 underline-offset-4 hover:underline">
            View public page
          </Link>
          {" · "}
          <Link href={`/memorials/${slug}/edit`} className="font-medium text-amber-800 underline-offset-4 hover:underline">
            Edit memorial
          </Link>
        </p>
      </div>

      {error && (
        <div className="space-y-2">
          <div className="rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-800 shadow-sm backdrop-blur">
            {error}
          </div>
          {SHOW_CHECKOUT_DEBUG_UI && checkoutDebugDetails && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowCheckoutDebug((v) => !v)}
                className="w-full rounded-md border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-1"
              >
                {showCheckoutDebug ? "Hide technical details" : "Show technical details"}
              </button>
              {showCheckoutDebug && (
                <pre className="max-h-48 overflow-auto rounded-md border border-slate-200 bg-white/90 p-3 text-xs leading-relaxed text-slate-700">
                  {checkoutDebugDetails}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {effective === "lifetime" ? (
        <p className="text-sm text-slate-600">
          This memorial already has <strong>Lifetime</strong> hosting. Thank you for your support.
        </p>
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-1 md:grid-cols-3">
          <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur">
            <h2 className="shrink-0 font-serif text-base font-semibold text-slate-900">
              Premium — Monthly
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              Larger gallery, no platform ads, ongoing updates while subscribed.
            </p>
            <button
              type="button"
              disabled={paidActive || loadingSku !== null}
              onClick={() => startCheckout("premium_monthly")}
              className="mt-4 w-full shrink-0 rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-amber-900/15 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSku === "premium_monthly" ? "Redirecting…" : "Subscribe monthly"}
            </button>
          </div>
          <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur">
            <h2 className="shrink-0 font-serif text-base font-semibold text-slate-900">
              Premium — Yearly
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              Same benefits as monthly, billed once per year.
            </p>
            <button
              type="button"
              disabled={paidActive || loadingSku !== null}
              onClick={() => startCheckout("premium_yearly")}
              className="mt-4 w-full shrink-0 rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-amber-900/15 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSku === "premium_yearly" ? "Redirecting…" : "Subscribe yearly"}
            </button>
          </div>
          <div className="flex h-full min-h-0 flex-col rounded-2xl border border-amber-200/90 bg-amber-50/50 p-5 shadow-sm backdrop-blur ring-1 ring-amber-200/60">
            <h2 className="shrink-0 font-serif text-base font-semibold text-slate-900">Lifetime</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              One-time payment. Keep expanded gallery and no platform ads permanently for this
              memorial.
            </p>
            <button
              type="button"
              disabled={loadingSku !== null}
              onClick={() => startCheckout("lifetime")}
              className="mt-4 w-full shrink-0 rounded-xl bg-amber-800 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-amber-900/20 transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSku === "lifetime" ? "Redirecting…" : "Buy lifetime"}
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        Compare features on the{" "}
        <Link href="/plans" className="font-medium text-amber-800 underline-offset-4 hover:underline">
          plans page
        </Link>
        .
      </p>
    </div>
  );
}
