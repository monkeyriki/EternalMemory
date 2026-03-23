"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getEffectiveHostingPlan,
  memorialPaidHostingActive,
  type MemorialHostingPlan
} from "@/lib/memorialHostingPlan";

type UpgradeMemorialClientProps = {
  memorialId: string;
  slug: string;
  fullName: string;
  hostingPlan: string | null;
  planExpiresAt: string | null;
  checkout?: string | null;
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
  checkout
}: UpgradeMemorialClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [loadingSku, setLoadingSku] = useState<string | null>(null);

  const effective = getEffectiveHostingPlan({
    hosting_plan: hostingPlan,
    plan_expires_at: planExpiresAt
  });
  const paidActive = memorialPaidHostingActive({
    hosting_plan: hostingPlan,
    plan_expires_at: planExpiresAt
  });

  async function startCheckout(plan: "premium_monthly" | "premium_yearly" | "lifetime") {
    setError(null);
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
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) {
        setError(data.error ?? "Checkout could not be started.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingSku(null);
    }
  }

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
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Payment received. Your memorial plan updates in a few seconds once Stripe confirms the
          webhook. Refresh this page if it does not change.
        </div>
      )}
      {checkout === "cancelled" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Checkout was cancelled. You can choose a plan again whenever you are ready.
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Memorial</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{fullName}</p>
        <p className="mt-2 text-sm text-slate-600">
          Current plan:{" "}
          <span className="font-medium text-slate-800">{planLabel(effective)}</span>
          {expiresDisplay ? (
            <span className="text-slate-500"> — renews or ends on {expiresDisplay}</span>
          ) : null}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          <Link href={`/memorials/${slug}`} className="font-medium text-sky-700 underline">
            View public page
          </Link>
          {" · "}
          <Link href={`/memorials/${slug}/edit`} className="font-medium text-sky-700 underline">
            Edit memorial
          </Link>
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {effective === "lifetime" ? (
        <p className="text-sm text-slate-600">
          This memorial already has <strong>Lifetime</strong> hosting. Thank you for your support.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
            <h2 className="text-base font-semibold text-slate-900">Premium — Monthly</h2>
            <p className="mt-2 text-sm text-slate-600">
              Larger gallery, no platform ads, ongoing updates while subscribed.
            </p>
            <button
              type="button"
              disabled={paidActive || loadingSku !== null}
              onClick={() => startCheckout("premium_monthly")}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSku === "premium_monthly" ? "Redirecting…" : "Subscribe monthly"}
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
            <h2 className="text-base font-semibold text-slate-900">Premium — Yearly</h2>
            <p className="mt-2 text-sm text-slate-600">
              Same benefits as monthly, billed once per year.
            </p>
            <button
              type="button"
              disabled={paidActive || loadingSku !== null}
              onClick={() => startCheckout("premium_yearly")}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSku === "premium_yearly" ? "Redirecting…" : "Subscribe yearly"}
            </button>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
            <h2 className="text-base font-semibold text-slate-900">Lifetime</h2>
            <p className="mt-2 text-sm text-slate-600">
              One-time payment. Keep expanded gallery and no platform ads permanently for this
              memorial.
            </p>
            <button
              type="button"
              disabled={loadingSku !== null}
              onClick={() => startCheckout("lifetime")}
              className="mt-4 w-full rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSku === "lifetime" ? "Redirecting…" : "Buy lifetime"}
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        Compare features on the{" "}
        <Link href="/plans" className="font-medium text-sky-700 underline">
          plans page
        </Link>
        .
      </p>
    </div>
  );
}
