import Link from "next/link";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <div className="relative min-h-[68vh] overflow-hidden px-4 py-16 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-sky-100/60 blur-3xl" />
      <div className="mx-auto max-w-3xl">
        <section className="relative rounded-3xl border border-slate-200/80 bg-white/85 px-6 py-12 text-center shadow-sm backdrop-blur sm:px-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            In loving memory
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            EternalMemory
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            A calm, respectful digital memorial platform to preserve stories, share condolences,
            and honor loved ones with dignity.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/memorials/new">
              <Button>Create memorial</Button>
            </Link>
            <Link href="/memorials">
              <Button variant="secondary">Browse memorials</Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-500 sm:text-sm">
            Mobile-friendly by design for QR links and shared memorial pages.
          </p>
        </section>
        <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-center text-xs text-slate-500 sm:grid-cols-3 sm:text-sm">
          <p className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2">
            Calm visual tone
          </p>
          <p className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2">
            Accessible navigation
          </p>
          <p className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2">
            Fast loading pages
          </p>
        </div>
      </div>
    </div>
  );
}
