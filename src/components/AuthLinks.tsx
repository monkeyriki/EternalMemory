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
    return <span className="inline-block h-9 w-24 animate-pulse rounded-lg bg-slate-100" aria-hidden />;
  }

  if (isLoggedIn) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm font-medium text-slate-600 underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
      >
        Sign out
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
      <Link
        href="/auth/login"
        className="text-sm font-semibold uppercase tracking-wide text-slate-600 transition-colors hover:text-slate-900"
      >
        Sign in
      </Link>
      <Link href="/auth/signup">
        <Button variant="accent" className="px-4 py-2 text-xs font-semibold uppercase tracking-wide">
          Sign up
        </Button>
      </Link>
    </div>
  );
}
