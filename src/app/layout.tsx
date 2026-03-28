import type { Metadata } from "next";
import Link from "next/link";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Playfair_Display } from "next/font/google";
import "./tailwind.generated.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_NAME } from "@/lib/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: "Digital memorial & obituary platform"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_38%,_#f8fafc_100%)] text-slate-900`}>
        <SiteHeader logoFontClassName={playfair.className} />
        <main className="flex-1">{children}</main>
        <SpeedInsights />
        <footer className="border-t border-slate-200/80 bg-white/95 px-4 py-8 text-sm text-slate-600 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-lg font-semibold text-slate-900">
                {SITE_NAME}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                A calm digital memorial platform
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link
                href="/about"
                className="rounded-md transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
              >
                About us
              </Link>
              <Link
                href="/plans"
                className="rounded-md transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
              >
                Plans
              </Link>
              <Link
                href="/privacy"
                className="rounded-md transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="rounded-md transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="rounded-md transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
              >
                Contact
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
