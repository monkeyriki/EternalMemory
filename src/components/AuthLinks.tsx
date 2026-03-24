"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Button } from "@/components/Button";

export function AuthLinks() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (isLoggedIn === null) {
    return (
      <span
        className="inline-block h-10 w-24 shrink-0 animate-pulse self-center rounded-lg bg-slate-100"
        aria-hidden
      />
    );
  }

  if (isLoggedIn) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex shrink-0 items-center rounded-md py-2 text-sm font-medium text-slate-600 underline-offset-4 transition-colors hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
      >
        Sign out
      </button>
    );
  }

  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-3">
      <Link
        href="/auth/login"
        className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
      >
        Sign in
      </Link>
      <Link href="/auth/signup" className="inline-flex shrink-0">
        <Button
          variant="accent"
          className="min-h-10 px-4 py-2 text-xs font-semibold uppercase tracking-wide"
        >
          Sign up
        </Button>
      </Link>
    </div>
  );
}
