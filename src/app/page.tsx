import Link from "next/link";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden pb-12">
      <section className="relative min-h-[78vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/hero-sky.png')] bg-cover bg-center"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/35 to-slate-50"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-700">
            In loving memory
          </p>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-slate-900 sm:text-6xl">
            Honor Those We Love
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-2xl">
            Create a lasting digital memorial to preserve and share cherished memories of your loved ones.
          </p>

          <form
            action="/memorials/new"
            method="get"
            className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/70 bg-white/90 p-5 text-left shadow-xl shadow-slate-900/10 backdrop-blur sm:p-7"
          >
            <p className="font-serif text-xl text-slate-800 sm:text-2xl">I want to share memories of</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                autoComplete="given-name"
                className="h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                autoComplete="family-name"
                className="h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80"
              />
              <Button type="submit" variant="accent" className="h-12 w-full sm:w-auto sm:min-w-[170px]">
                Get Started
              </Button>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-4 text-center">
              <Link
                href="/memorials"
                className="rounded-md text-sm text-slate-600 hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
              >
                About online memorials <span className="text-amber-700">›</span>
              </Link>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
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
