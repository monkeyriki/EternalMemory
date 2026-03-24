import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CreditCard, Heart, LayoutGrid, Sparkles } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { MemorialPageShell } from "@/components/memorial/MemorialPageShell";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Dashboard — EternalMemory",
  description: "Manage your memorials, plans, and B2B tools."
};

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: memorials } = await supabase
    .from("memorials")
    .select("id, slug, type, full_name, visibility, is_draft, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const list = memorials ?? [];
  const hasMemorials = list.length > 0;
  const showB2BBanner = profile?.role !== "b2b";
  const email = user.email ?? "";

  return (
    <MemorialPageShell
      title="Dashboard"
      subtitle={
        email
          ? `Signed in as ${email}. Manage your memorials and quick links from here.`
          : "Manage your memorials and quick links from here."
      }
      maxWidth="5xl"
      contentClassName="mt-6 space-y-8"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/memorials/new"
          className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-4 shadow-sm backdrop-blur transition hover:border-amber-200/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-800 ring-1 ring-amber-200/80">
            <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">New memorial</p>
            <p className="text-xs text-slate-500">Create a page</p>
          </div>
        </Link>
        <Link
          href="/memorials"
          className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-4 shadow-sm backdrop-blur transition hover:border-amber-200/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
            <LayoutGrid className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Directory</p>
            <p className="text-xs text-slate-500">Browse public</p>
          </div>
        </Link>
        <Link
          href="/plans"
          className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-4 shadow-sm backdrop-blur transition hover:border-amber-200/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 sm:col-span-2 lg:col-span-1"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200/70">
            <CreditCard className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Plans & features</p>
            <p className="text-xs text-slate-500">Hosting options</p>
          </div>
        </Link>
        <Link
          href="/account/delete"
          className="flex items-center gap-3 rounded-2xl border border-red-200/80 bg-red-50/70 px-4 py-4 shadow-sm backdrop-blur transition hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 focus-visible:ring-offset-2 sm:col-span-2 lg:col-span-1"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-700 ring-1 ring-red-200">
            <Heart className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Delete account</p>
            <p className="text-xs text-slate-600">Privacy request</p>
          </div>
        </Link>
        <Link
          href="/memorials"
          className="group flex items-center gap-3 rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/80 px-4 py-4 text-sm font-medium text-slate-600 transition hover:border-amber-200 hover:bg-amber-50/40 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 sm:col-span-2 lg:col-span-2"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 ring-1 ring-slate-200 transition group-hover:ring-amber-200">
            <Heart className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="text-left leading-snug">
            Browse memorials
            <span className="block text-xs font-normal text-slate-500 group-hover:text-slate-600">
              Humans & pets
            </span>
          </span>
        </Link>
      </div>

      {showB2BBanner && (
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 px-5 py-4 shadow-sm backdrop-blur">
          <p className="text-sm font-medium text-amber-950">
            Funeral home or pet crematorium? Join our B2B program.
          </p>
          <p className="mt-1 text-xs text-amber-900/80">
            Bulk memorials for clients with a monthly subscription.
          </p>
          <Link
            href="/dashboard/b2b"
            className="mt-3 inline-flex rounded-md text-sm font-semibold text-amber-800 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
          >
            Open B2B dashboard →
          </Link>
        </div>
      )}

      <section aria-labelledby="dash-memorials-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="dash-memorials-heading"
              className="font-serif text-2xl font-semibold tracking-tight text-slate-900"
            >
              Your memorials
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {hasMemorials ? `${list.length} total` : "None yet — create your first below."}
            </p>
          </div>
          <Link href="/memorials/new">
            <Button variant="accent" className="px-5 py-2 text-xs font-semibold uppercase tracking-wide">
              + Create memorial
            </Button>
          </Link>
        </div>

        {!hasMemorials ? (
          <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white/95 p-10 text-center shadow-md shadow-slate-400/10 backdrop-blur">
            <div className="mb-3 text-3xl" aria-hidden>
              🕯️
            </div>
            <h3 className="font-serif text-xl font-semibold text-slate-900">No memorials yet</h3>
            <p className="mt-1 text-sm text-slate-500">Create your first memorial to get started.</p>
            <div className="mt-4">
              <Link href="/memorials/new">
                <Button variant="accent" className="px-6 py-2.5 text-sm">
                  Create a memorial
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {list.map((m) => {
              const typeLabel =
                m.type === "human" ? "Human" : m.type === "pet" ? "Pet" : m.type;
              const statusLabel = m.is_draft ? "Draft" : "Published";
              const visibilityLabel =
                m.visibility === "public"
                  ? "Public"
                  : m.visibility === "unlisted"
                    ? "Unlisted"
                    : m.visibility === "password_protected"
                      ? "Protected"
                      : m.visibility;

              const statusClasses = m.is_draft
                ? "bg-slate-100 text-slate-600"
                : "bg-emerald-100 text-emerald-800";

              return (
                <li
                  key={m.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-md shadow-slate-400/5 backdrop-blur transition hover:border-amber-200/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg font-semibold text-slate-900">{m.full_name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-800">
                        {typeLabel}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${statusClasses}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
                        {visibilityLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    <Link href={`/memorials/${m.slug}`}>
                      <Button variant="secondary" className="px-4 py-2 text-xs">
                        View
                      </Button>
                    </Link>
                    <Link href={`/memorials/${m.slug}/edit`}>
                      <Button variant="accent" className="px-4 py-2 text-xs">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/memorials/${m.slug}/upgrade`}>
                      <Button variant="secondary" className="px-4 py-2 text-xs">
                        Plan
                      </Button>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </MemorialPageShell>
  );
}
