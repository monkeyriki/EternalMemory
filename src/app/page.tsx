import Link from "next/link";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden px-4 py-10 sm:py-14">
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-200">
        <div className="absolute inset-0 bg-[url('/memorial-hero.svg')] bg-cover bg-center opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/35 to-white/75" />
        <div className="relative px-5 py-12 sm:px-10 sm:py-16">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
            In loving memory
          </p>
          <h1 className="mt-4 text-center font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Honor Those We Love
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed text-slate-700 sm:text-2xl">
            Create a lasting digital memorial to preserve stories, photos, and condolences.
          </p>

          <form action="/memorials/new" method="get" className="mx-auto mt-9 max-w-4xl rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-lg shadow-slate-500/10 sm:p-6">
            <p className="text-lg text-slate-800 sm:text-3xl">I want to share memories of</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <Button type="submit" className="h-12 min-w-[180px] bg-amber-600 hover:bg-amber-500">
                Get started
              </Button>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-3 text-center">
              <Link href="/memorials" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                About online memorials
              </Link>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Fast setup</h2>
          <p className="mt-1 text-sm text-slate-600">Publish a meaningful memorial page in minutes.</p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Designed for families</h2>
          <p className="mt-1 text-sm text-slate-600">Simple sharing via link and QR, from any device.</p>
        </article>
        <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Respectful and private</h2>
          <p className="mt-1 text-sm text-slate-600">Control visibility and keep memories in one safe place.</p>
        </article>
      </section>
    </div>
  );
}
