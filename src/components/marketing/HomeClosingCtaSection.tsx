import Link from "next/link";

/**
 * Final home CTA strip — matches v0 “Honor Someone Special” hero-style block.
 */
export function HomeClosingCtaSection() {
  return (
    <section
      className="border-t border-slate-200/80 bg-[#fdfcfa] py-16 sm:py-20 md:py-24"
      aria-labelledby="closing-cta-heading"
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#e07a3f]">
          Begin today
        </p>
        <h2
          id="closing-cta-heading"
          className="mt-4 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-[2.5rem] md:leading-tight"
        >
          Honor Someone Special
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Create a beautiful, lasting tribute to someone you love. It only takes a few minutes to
          start preserving their memory for generations to come.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <Link
            href="/memorials/new"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-[#e07a3f] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#d96c2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/50 focus-visible:ring-offset-2"
          >
            Create a Memorial
          </Link>
          <Link
            href="/#how-it-works"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-[#e07a3f] shadow-sm transition hover:border-[#e07a3f]/30 hover:bg-[#fffaf7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 focus-visible:ring-offset-2"
          >
            Learn More
          </Link>
        </div>
        <p className="mt-8 text-xs text-slate-500 sm:text-sm">
          Free to create <span className="text-slate-400">•</span> No credit card required
        </p>
      </div>
    </section>
  );
}
