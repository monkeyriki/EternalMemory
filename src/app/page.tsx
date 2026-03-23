import Link from "next/link";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden px-4 py-10 sm:py-14">
      {/* No UI-mock SVG as full-bleed bg — it looked like “broken” gray boxes behind the form */}
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-100">
        <div
          className="absolute inset-0 bg-gradient-to-b from-sky-200/90 via-orange-100/50 to-white"
          aria-hidden
        />
        <div
          className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-sky-300/35 blur-3xl"
          aria-hidden
        />
        <div className="relative px-5 py-14 sm:px-10 sm:py-20">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
            In loving memory
          </p>
          <h1 className="mt-5 text-center font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Honor Those We Love
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-slate-700 sm:text-xl">
            Create a lasting digital memorial to preserve stories, photos, and condolences.
          </p>

          <form
            action="/memorials/new"
            method="get"
            className="mx-auto mt-12 max-w-xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-400/15 sm:mt-14 sm:p-8"
          >
            <p className="text-center font-serif text-xl text-slate-800 sm:text-2xl">
              I want to share memories of
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                autoComplete="given-name"
                className="h-12 w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                autoComplete="family-name"
                className="h-12 w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80"
              />
              <Button type="submit" variant="accent" className="h-12 w-full shrink-0 px-6 sm:w-auto sm:min-w-[11rem]">
                Get started
              </Button>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <Link href="/memorials" className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline">
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
