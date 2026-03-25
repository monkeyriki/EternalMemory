"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Button } from "@/components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    // Build redirect from the actual page origin (avoid env mistakes on Vercel previews).
    const redirectTo = `${window.location.origin}/auth/callback?next=/auth/update-password`;

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo
    });

    setLoading(false);
    if (err) {
      console.error("[forgot-password] resetPasswordForEmail error:", err);
      // Supabase sometimes returns a generic message when the Auth email provider is misconfigured.
      if (err.message?.toLowerCase().includes("error sending recovery email")) {
        setError(
          "Password recovery email failed to send. Check Supabase Auth email provider (SMTP) and allowed redirect URLs."
        );
        return;
      }
      setError(err.message);
      return;
    }
    setSuccess("Recovery email sent. Check your inbox to reset your password.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900 text-center">
          Reset password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
              autoComplete="email"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-700" role="status">
              {success}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending…" : "Send recovery email"}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Back to{" "}
          <Link href="/auth/login" className="text-slate-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
