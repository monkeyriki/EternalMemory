import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    // Middleware normally sends unauthenticated users to /auth/login?next=…
    redirect("/auth/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl bg-slate-900 p-3 text-white shadow-sm">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Admin
              </p>
              <p className="mt-1 text-lg font-semibold">Control panel</p>
            </div>
            <AdminNav />
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

