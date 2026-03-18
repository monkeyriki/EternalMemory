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
      <span className="text-sm text-slate-500">Caricamento…</span>
    );
  }

  if (isLoggedIn) {
    return (
      <Button variant="secondary" type="button" onClick={handleLogout}>
        Esci
      </Button>
    );
  }

  return (
    <Link href="/auth/login">
      <Button variant="secondary">Accedi</Button>
    </Link>
  );
}
