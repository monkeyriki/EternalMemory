"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { getPrivacyEmail } from "@/lib/privacyContact";
import { requestAccountDeletionAction } from "./actions";

const privacyEmail = getPrivacyEmail();

export function DeleteAccountRequestForm() {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await requestAccountDeletionAction(reason);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess(
      "Your request was submitted. Our privacy team will review it and contact you by email."
    );
    setReason("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-700" htmlFor="reason">
        Reason (optional)
      </label>
      <textarea
        id="reason"
        rows={5}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={1200}
        placeholder="Tell us why you want to delete your account..."
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80"
      />
      <p className="text-xs text-slate-500">
        This creates a tracked request. For immediate support, contact{" "}
        <a
          href={`mailto:${privacyEmail}`}
          className="rounded-md text-amber-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          {privacyEmail}
        </a>
        .
      </p>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="accent" disabled={loading}>
          {loading ? "Submitting..." : "Request account deletion"}
        </Button>
        <Link href="/dashboard">
          <Button type="button" variant="secondary">
            Back to dashboard
          </Button>
        </Link>
      </div>
    </form>
  );
}
