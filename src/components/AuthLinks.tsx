"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

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
        className="inline-block h-10 w-20 shrink-0 animate-pulse self-center rounded-lg bg-slate-100"
        aria-hidden
      />
    );
  }

  if (isLoggedIn) {
    return (
      <div className="flex shrink-0 flex-nowrap items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
    >
      Sign in
    </Link>
  );
}
