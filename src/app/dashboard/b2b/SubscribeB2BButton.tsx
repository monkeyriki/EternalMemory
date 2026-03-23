"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

export function SubscribeB2BButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/b2b-checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly" })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Checkout failed."
        );
        return;
      }
      if (data.url && typeof data.url === "string") {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button type="button" variant="accent" onClick={subscribe} disabled={loading} className="px-6 py-2.5 text-sm">
        {loading ? "Redirecting…" : "Subscribe now"}
      </Button>
      {error && (
        <p className="mt-3 rounded-xl border border-red-200/90 bg-red-50/90 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
