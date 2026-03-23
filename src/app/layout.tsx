import type { Metadata } from "next";
import Link from "next/link";
import "./tailwind.generated.css";
import { AuthLinks } from "@/components/AuthLinks";

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
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100/80 text-slate-900">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
            <div className="flex items-center gap-5">
              <Link href="/" className="font-semibold tracking-tight text-slate-900">
                EternalMemory
              </Link>
              <nav className="flex gap-3 text-sm sm:gap-4">
                <Link href="/memorials" className="text-slate-600 hover:text-slate-900">
                  Memorials
                </Link>
                <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                  Dashboard
                </Link>
                <Link href="/admin" className="text-slate-600 hover:text-slate-900">
                  Admin
                </Link>
              </nav>
            </div>
            <div className="shrink-0">
              <AuthLinks />
            </div>
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
