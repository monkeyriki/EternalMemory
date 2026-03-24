"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Button } from "@/components/Button";
import { safeAuthRedirectPath } from "@/lib/safeAuthRedirect";

export function LoginForm() {
  const searchParams = useSearchParams();
  const afterLoginPath = useMemo(
    () => safeAuthRedirectPath(searchParams.get("next"), "/"),
    [searchParams]
  );
  const signupHref = useMemo(() => {
    const q = new URLSearchParams();
    if (afterLoginPath !== "/") q.set("next", afterLoginPath);
    const s = q.toString();
    return s ? `/auth/signup?${s}` : "/auth/signup";
  }, [afterLoginPath]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(afterLoginPath);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Sign in
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href={signupHref} className="text-slate-900 underline">
            Sign up
          </Link>
        </p>
        <p className="text-center text-sm text-slate-600">
          Forgot your password?{" "}
          <Link
            href="/auth/forgot-password"
            className="text-slate-900 underline"
          >
            Reset it
          </Link>
        </p>
      </div>
    </main>
  );
}
