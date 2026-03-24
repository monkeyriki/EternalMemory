import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import "./tailwind.generated.css";
import { SiteHeader } from "@/components/SiteHeader";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "EternalMemory",
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
        <footer className="border-t border-slate-200/80 bg-white/95 px-4 py-8 text-sm text-slate-600 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-lg font-semibold text-slate-900">
                EternalMemory
              </p>
              <p className="mt-1 text-xs text-slate-500">
                A calm digital memorial platform
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link href="/plans" className="transition hover:text-slate-900 hover:underline">
                Plans
              </Link>
              <Link href="/privacy" className="transition hover:text-slate-900 hover:underline">
                Privacy
              </Link>
              <Link href="/terms" className="transition hover:text-slate-900 hover:underline">
                Terms
              </Link>
              <Link href="/contact" className="transition hover:text-slate-900 hover:underline">
                Contact
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
