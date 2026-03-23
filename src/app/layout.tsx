import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import "./tailwind.generated.css";
import { AuthLinks } from "@/components/AuthLinks";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"]
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
      <body className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_38%,_#f8fafc_100%)] text-slate-900">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="rounded-full border border-amber-200/70 bg-white px-3 py-1.5 text-sm font-semibold tracking-tight text-slate-900 shadow-sm">
                <span className={`${playfair.className} text-base`}>eternalmemory</span>
              </Link>
              <div className="shrink-0">
                <AuthLinks />
              </div>
            </div>
            <nav className="flex items-center gap-5 overflow-x-auto whitespace-nowrap pb-1 text-sm text-slate-600">
              <Link href="/" className="hover:text-slate-900">
                Home
              </Link>
              <Link href="/memorials" className="hover:text-slate-900">
                  Memorials
              </Link>
              <Link href="/dashboard" className="hover:text-slate-900">
                  Dashboard
              </Link>
              <Link href="/admin" className="hover:text-slate-900">
                  Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200/80 bg-white/95 px-4 py-4 text-center text-sm text-slate-500">
          EternalMemory - A calm digital memorial platform
        </footer>
      </body>
    </html>
  );
}
