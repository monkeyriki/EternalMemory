import Image from "next/image";
import Link from "next/link";

const accentBtn =
  "inline-flex items-center justify-center rounded-full bg-[#e07a3f] px-8 py-3 text-sm font-medium text-white shadow-md transition hover:bg-[#d96c2f] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/50 focus-visible:ring-offset-2";
const outlineBtn =
  "inline-flex items-center justify-center rounded-full border border-[#e07a3f]/30 px-8 py-3 text-sm font-medium text-[#e07a3f] transition hover:bg-[#e07a3f]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/40 focus-visible:ring-offset-2";

/**
 * “Why Choose Us” — two-column block (copy + hero image). Lives on the homepage; nav targets #why-evermissed.
 */
export function WhyChooseUsSection() {
  return (
    <section
      id="why-evermissed"
      className="relative scroll-mt-28 overflow-hidden border-b border-[#e8e6e3]/50 bg-[#fdfcfa] py-14 sm:py-16 md:py-20"
      aria-labelledby="why-choose-us-heading"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#fdfcfa] via-[#faf8f5] to-[#f5f3f0]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="order-2 lg:order-1">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#e07a3f]">
              Why Choose Us
            </p>
            <h2
              id="why-choose-us-heading"
              className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-[#3a3a3a] text-balance md:text-5xl lg:text-[3.25rem]"
            >
              A Meaningful Way to Remember
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#6a6a6a] md:text-xl">
              EverMissed provides a beautiful, lasting space to celebrate the lives of those who
              have touched our hearts. Because every story deserves to be told, and every memory
              deserves to be treasured.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/memorials/new" className={accentBtn}>
                Create a Memorial
              </Link>
              <Link href="/memorials" className={outlineBtn}>
                Browse Memorials
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 transition duration-500 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)]">
              <Image
                src="/images/why-hero.jpg"
                alt="Hands holding cherished memories"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
