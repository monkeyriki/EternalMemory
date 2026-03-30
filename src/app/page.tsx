import Link from "next/link";
import { Quote } from "lucide-react";
import { Button } from "@/components/Button";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import MemorialCard from "@/components/memorial/MemorialCard";

const HOME_MEMORIAL_LIMIT = 4;

const homeTestimonials = [
  {
    quote:
      "Creating a memorial for my mother was a healing experience. EverMissed gave us a beautiful space where our entire family could share memories and feel connected.",
    author: "Sarah M.",
    detail: "Portland, Oregon"
  },
  {
    quote:
      "The attention to detail and respect shown in every aspect of the platform is remarkable. It feels like a sacred space, not just a website.",
    author: "James C.",
    detail: "San Francisco, California"
  },
  {
    quote:
      "We received tributes from people all over the world who knew my grandmother. Reading their stories gave us comfort during an incredibly difficult time.",
    author: "Maria S.",
    detail: "Miami, Florida"
  }
];

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();
  const { data: memorialRows } = await supabase
    .from("memorials")
    .select(
      "id, slug, type, full_name, date_of_birth, date_of_death, city, story, tags, cover_image_url"
    )
    .eq("visibility", "public")
    .eq("is_draft", false)
    .order("created_at", { ascending: false })
    .limit(HOME_MEMORIAL_LIMIT);

  const memorials = memorialRows ?? [];
  const memorialIds = memorials.map((m) => m.id);
  const tributeCountByMemorialId = new Map<string, number>();
  const photoCountByMemorialId = new Map<string, number>();

  if (memorialIds.length > 0) {
    const { data: tributeRows } = await supabase
      .from("virtual_tributes")
      .select("memorial_id")
      .in("memorial_id", memorialIds)
      .eq("is_approved", true);
    for (const row of tributeRows ?? []) {
      const memorialId = (row as any).memorial_id as string;
      tributeCountByMemorialId.set(
        memorialId,
        (tributeCountByMemorialId.get(memorialId) ?? 0) + 1
      );
    }

    const { data: mediaRows } = await supabase
      .from("memorial_media")
      .select("memorial_id")
      .in("memorial_id", memorialIds);
    for (const row of mediaRows ?? []) {
      const memorialId = (row as any).memorial_id as string;
      photoCountByMemorialId.set(
        memorialId,
        (photoCountByMemorialId.get(memorialId) ?? 0) + 1
      );
    }
  }

  return (
    <div className="relative overflow-hidden pb-16 md:pb-20">
      <section className="relative min-h-[min(82vh,900px)] overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/hero-sky.png')] bg-cover bg-center"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/38 to-[#f8f6f3]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#e07a3f]">
            In loving memory
          </p>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Honor Those We Love
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-xl md:text-2xl md:leading-snug">
            Create a lasting digital memorial to preserve and share cherished memories of your loved ones.
          </p>

          <form
            action="/memorials/new"
            method="get"
            className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/80 bg-white/92 p-5 text-left shadow-xl shadow-slate-900/[0.08] backdrop-blur-md transition-shadow duration-300 hover:shadow-2xl hover:shadow-slate-900/10 sm:p-7"
          >
            <p className="font-serif text-xl text-slate-800 sm:text-2xl">I want to share memories of</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                autoComplete="given-name"
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-[#e07a3f]/40 focus:outline-none focus:ring-2 focus:ring-[#e07a3f]/25"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                autoComplete="family-name"
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-[#e07a3f]/40 focus:outline-none focus:ring-2 focus:ring-[#e07a3f]/25"
              />
              <Button
                type="submit"
                variant="accent"
                className="h-12 w-full shadow-md shadow-amber-900/10 transition hover:shadow-lg sm:w-auto sm:min-w-[170px]"
              >
                Get Started
              </Button>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-4 text-center">
              <Link
                href="/memorials"
                className="rounded-md text-sm font-medium text-slate-600 transition hover:text-[#e07a3f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 focus-visible:ring-offset-2"
              >
                About online memorials <span className="text-[#e07a3f]">›</span>
              </Link>
            </div>
          </form>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto mt-10 max-w-6xl scroll-mt-28 px-4 sm:mt-14"
        aria-labelledby="how-it-works-heading"
      >
        <div className="rounded-3xl border border-slate-200/60 bg-gradient-to-b from-white to-[#faf9f7]/80 px-5 py-10 shadow-sm sm:px-8 sm:py-12 md:px-10">
          <div className="mb-8 text-center sm:mb-10 sm:text-left">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#e07a3f]">
              Simple process
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-2 font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
            >
              Why families choose us
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:mx-0">
              Thoughtful tools for a calm, respectful space to remember someone special.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            <article className="group rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#e07a3f]/25 hover:shadow-md sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Fast setup</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Publish a meaningful memorial page in minutes.
              </p>
            </article>
            <article className="group rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#e07a3f]/25 hover:shadow-md sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Designed for families</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Simple sharing via link and QR, from any device.
              </p>
            </article>
            <article className="group rounded-2xl border border-slate-200/70 bg-white/95 p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#e07a3f]/25 hover:shadow-md sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Respectful and private</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Control visibility and keep memories in one safe place.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="testimonials"
        className="mx-auto mt-14 max-w-6xl scroll-mt-28 px-4 py-14 sm:mt-16 sm:py-16 md:py-20"
        aria-labelledby="testimonials-heading"
      >
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#e07a3f]">
            From our community
          </p>
          <h2
            id="testimonials-heading"
            className="mt-2 font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Stories of comfort & connection
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Families share how they have honored loved ones and found solace in shared memories.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {homeTestimonials.map((t) => (
            <article
              key={t.author}
              className="group relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Quote
                className="absolute right-4 top-4 h-8 w-8 text-[#e07a3f]/12 transition group-hover:text-[#e07a3f]/25"
                aria-hidden
              />
              <blockquote className="pr-6 text-sm leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <p className="mt-5 border-t border-slate-100 pt-4 font-medium text-slate-900">{t.author}</p>
              <p className="text-xs text-slate-500">{t.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="mx-auto mt-2 max-w-6xl px-4 pb-2"
        aria-labelledby="home-memorials-heading"
      >
        <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#e07a3f]">
              Honoring those we love
            </p>
            <h2
              id="home-memorials-heading"
              className="mt-2 font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
            >
              Featured memorials
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
              Recently published public pages (up to {HOME_MEMORIAL_LIMIT}). Humans and pets.
            </p>
          </div>
          <Link
            href="/memorials"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#c45d2c] underline-offset-4 transition hover:text-[#e07a3f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 focus-visible:ring-offset-2"
          >
            Browse all memorials
            <span aria-hidden>→</span>
          </Link>
        </div>

        {memorials.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200/90 bg-white/90 p-10 text-center text-sm text-slate-600 shadow-sm">
            <p>No public memorials yet.</p>
            <p className="mt-3">
              <Link
                href="/memorials/new"
                className="font-semibold text-[#c45d2c] underline-offset-4 transition hover:text-[#e07a3f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 focus-visible:ring-offset-2"
              >
                Create the first memorial
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-8 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {memorials.map((m) => (
              <MemorialCard
                key={m.id}
                slug={m.slug}
                name={m.full_name}
                type={m.type === "pet" ? "pet" : "human"}
                dateOfBirth={m.date_of_birth}
                dateOfDeath={m.date_of_death}
                description={m.story}
                city={m.city}
                tags={m.tags ?? []}
                tributeCount={tributeCountByMemorialId.get(m.id) ?? 0}
                likesCount={tributeCountByMemorialId.get(m.id) ?? 0}
                photosCount={photoCountByMemorialId.get(m.id) ?? 0}
                coverImageUrl={m.cover_image_url}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
