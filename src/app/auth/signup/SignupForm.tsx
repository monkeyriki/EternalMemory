"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Button } from "@/components/Button";
import { safeAuthRedirectPath } from "@/lib/safeAuthRedirect";

export function SignupForm() {
  const searchParams = useSearchParams();
  const afterSignupPath = useMemo(
    () => safeAuthRedirectPath(searchParams.get("next"), "/"),
    [searchParams]
  );
  const loginHref = useMemo(() => {
    const q = new URLSearchParams();
    if (afterSignupPath !== "/") q.set("next", afterSignupPath);
    const s = q.toString();
    return s ? `/auth/login?${s}` : "/auth/login";
  }, [afterSignupPath]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      window.location.origin;
    const nextQ = encodeURIComponent(afterSignupPath);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${base}/auth/callback?next=${nextQ}`,
        data: { display_name: displayName || undefined }
      }
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSuccess("Account created. Check your email to verify your account.");
    setEmail("");
    setPassword("");
    setDisplayName("");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Sign up
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Display name (optional)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
              autoComplete="name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
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
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
              autoComplete="new-password"
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
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="rounded-md text-slate-900 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
