import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
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
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-slate-900">
              EternalMemory
            </Link>
            <nav className="flex gap-4 text-sm">
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
          <AuthLinks />
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-sm text-slate-500">
          EternalMemory — A calm digital memorial platform
        </footer>
      </body>
    </html>
  );
}
