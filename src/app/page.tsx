import Link from "next/link";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <div className="relative min-h-[72vh] overflow-hidden px-4 py-14 sm:py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-20 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 px-6 py-12 shadow-xl shadow-slate-300/20 backdrop-blur sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-100/65 to-transparent" />
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            In loving memory
          </p>
          <h1 className="text-center text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Keep Their Memory Alive
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-slate-600 sm:text-lg">
            Create beautiful digital memorial pages to share stories, photos, and condolences with
            family and friends anywhere.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/memorials/new">
              <Button>Create memorial now</Button>
            </Link>
            <Link href="/memorials">
              <Button variant="secondary">Browse memorials</Button>
            </Link>
          </div>
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <p className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-center shadow-sm">
              Elegant pages in under 2 minutes
            </p>
            <p className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-center shadow-sm">
              Mobile-first and easy to share
            </p>
            <p className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-center shadow-sm">
              Private, respectful, and secure
            </p>
          </div>
        </section>
        <section className="mx-auto mt-10 max-w-5xl rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-6 shadow-sm sm:p-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            How it works
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">Step 1</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Create a memorial</h3>
              <p className="mt-2 text-sm text-slate-600">
                Add the name, dates, biography, and a meaningful cover image.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">Step 2</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Share with family</h3>
              <p className="mt-2 text-sm text-slate-600">
                Send the link or print a QR code for ceremonies and gatherings.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">Step 3</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Collect memories</h3>
              <p className="mt-2 text-sm text-slate-600">
                Invite condolences, photos, and stories in one lasting space.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
