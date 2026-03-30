"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { AuthLinks } from "@/components/AuthLinks";

type SiteHeaderProps = {
  logoFontClassName?: string;
};

const navItems = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Memorials", href: "/memorials" },
  { label: "Why EverMissed", href: "/why-evermissed" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Plans", href: "/plans" },
  { label: "About", href: "/about" }
];

export function SiteHeader({ logoFontClassName = "" }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center justify-between gap-2 px-4 py-3 sm:gap-3 md:py-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          <Heart className="h-6 w-6 text-amber-600" strokeWidth={1.8} />
          <span className={`${logoFontClassName} text-xl font-semibold tracking-tight text-slate-900 md:text-2xl`}>
            ever<span className="text-amber-600">missed</span>
          </span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-0.5 lg:gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-2 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 lg:px-3"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 flex-nowrap items-center gap-3 md:flex">
          <Link
            href="/memorials/new"
            className="inline-flex items-center justify-center rounded-full bg-[#e07a3f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d96c2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/50 focus-visible:ring-offset-2"
          >
            Create Memorial
          </Link>
          <AuthLinks />
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="shrink-0 rounded-md p-1 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 md:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          type="button"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/memorials/new"
              onClick={() => setMobileOpen(false)}
              className="block rounded-full bg-[#e07a3f] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#d96c2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/50"
            >
              Create Memorial
            </Link>
            <div
              className="border-t border-slate-200 pt-3"
              onClick={() => setMobileOpen(false)}
            >
              <AuthLinks />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
