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
      <body className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_#f8fafc_0%,_#eef2ff_38%,_#f8fafc_100%)] text-slate-900">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
            <div className="flex items-center gap-5">
              <Link href="/" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold tracking-tight text-slate-900 shadow-sm">
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
