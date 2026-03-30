"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type AuthUiState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; isAdmin: boolean };

export function AuthLinks() {
  const [state, setState] = useState<AuthUiState>({ status: "loading" });
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function applySession(session: Session | null) {
      if (!session?.user) {
        setState({ status: "guest" });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      const role = (data as { role?: string } | null)?.role;
      setState({ status: "user", isAdmin: role === "admin" });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (state.status === "loading") {
    return (
      <span
        className="inline-block h-10 w-28 shrink-0 animate-pulse self-center rounded-lg bg-slate-100"
        aria-hidden
      />
    );
  }

  if (state.status === "user") {
    return (
      <div className="flex shrink-0 flex-nowrap items-center gap-3">
        {state.isAdmin ? (
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-50 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
          >
            Admin
          </Link>
        ) : null}
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
    >
      Sign In
    </Link>
  );
}
