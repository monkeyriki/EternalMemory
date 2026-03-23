"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Search, X } from "lucide-react";
import { AuthLinks } from "@/components/AuthLinks";
import { Button } from "@/components/Button";

type SiteHeaderProps = {
  logoFontClassName?: string;
};

const navItems = [
  { label: "Home", href: "/" },
  { label: "Memorials", href: "/memorials" },
  { label: "Plans & Features", href: "/plans" },
  { label: "Dashboard", href: "/dashboard" }
];

export function SiteHeader({ logoFontClassName = "" }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:py-4">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-amber-600" strokeWidth={1.8} />
          <span className={`${logoFontClassName} text-xl font-semibold tracking-tight text-slate-900 md:text-2xl`}>
            eternal<span className="text-amber-600">memory</span>
          </span>
        </Link>

        <form action="/memorials" method="get" className="hidden min-w-[220px] items-center gap-2 rounded-full bg-slate-100 px-4 py-2 md:flex">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            name="q"
            placeholder="Find a memorial..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
        </form>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <AuthLinks />
          <Link href="/memorials/new">
            <Button variant="accent" className="px-5 py-2 text-xs">
              Create Memorial
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md p-1 text-slate-700 lg:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          type="button"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="space-y-3 px-4 py-4">
            <form action="/memorials" method="get" className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                name="q"
                placeholder="Find a memorial..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
            </form>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t border-slate-200 pt-3">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-center text-sm text-slate-600">
                Sign in
              </Link>
              <Link href="/memorials/new" onClick={() => setMobileOpen(false)}>
                <Button variant="accent" className="w-full py-2 text-xs">
                  Create Memorial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
