"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
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
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSearchType, setDesktopSearchType] = useState<"humans" | "pets">(
    "humans"
  );
  const [mobileSearchType, setMobileSearchType] = useState<"humans" | "pets">(
    "humans"
  );

  const submitSearch = (
    e: FormEvent<HTMLFormElement>,
    type: "humans" | "pets"
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const path = `/memorials/${type}`;
    router.push(search ? `${path}?search=${encodeURIComponent(search)}` : path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center justify-between gap-2 px-4 py-3 sm:gap-3 md:py-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
        >
          <Heart className="h-6 w-6 text-amber-600" strokeWidth={1.8} />
          <span className={`${logoFontClassName} text-xl font-semibold tracking-tight text-slate-900 md:text-2xl`}>
            eternal<span className="text-amber-600">memory</span>
          </span>
        </Link>

        <form
          onSubmit={(e) => submitSearch(e, desktopSearchType)}
          className="hidden min-w-[220px] items-center gap-2 rounded-full bg-slate-100 px-3 py-2 md:flex"
        >
          <select
            aria-label="Memorial category"
            value={desktopSearchType}
            onChange={(e) =>
              setDesktopSearchType(e.target.value as "humans" | "pets")
            }
            className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70"
          >
            <option value="humans">Humans</option>
            <option value="pets">Pets</option>
          </select>
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            name="search"
            placeholder="Find a memorial..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
          />
        </form>

        <nav className="hidden shrink-0 items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 flex-nowrap items-center gap-2 md:flex md:gap-3 lg:gap-4">
          <AuthLinks />
          <Link href="/memorials/new" className="inline-flex shrink-0">
            <Button variant="accent" className="min-h-10 whitespace-nowrap px-4 py-2 text-xs sm:px-5">
              Create Memorial
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="shrink-0 rounded-md p-1 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 focus-visible:ring-offset-2 lg:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          type="button"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="space-y-3 px-4 py-4">
            <form
              onSubmit={(e) => submitSearch(e, mobileSearchType)}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2"
            >
              <select
                aria-label="Memorial category"
                value={mobileSearchType}
                onChange={(e) =>
                  setMobileSearchType(e.target.value as "humans" | "pets")
                }
                className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70"
              >
                <option value="humans">Humans</option>
                <option value="pets">Pets</option>
              </select>
              <Search className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                name="search"
                placeholder="Find a memorial..."
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
            </form>
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
            <div className="flex flex-col items-stretch gap-3 border-t border-slate-200 pt-3">
              <div
                className="flex w-full flex-nowrap items-center justify-center gap-3"
                onClick={() => setMobileOpen(false)}
              >
                <AuthLinks />
              </div>
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
