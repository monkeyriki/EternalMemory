import Link from "next/link";
import { Heart } from "lucide-react";
import { SITE_NAME } from "@/lib/site";

const linkClass =
  "rounded-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2d2d2d]";

type FooterCol = { title: string; links: { label: string; href: string }[] };

const columns: FooterCol[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Mission", href: "/about" },
      { label: "Careers", href: "/contact" },
      { label: "Press", href: "/contact" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/contact" },
      { label: "Grief Support", href: "/contact" },
      { label: "Memorial Guide", href: "/memorials" },
      { label: "Blog", href: "/contact" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy" },
      { label: "Accessibility", href: "/contact" }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#2d2d2d] text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a3f]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2d2d2d]"
            >
              <Heart className="h-6 w-6 text-[#e07a3f]" strokeWidth={1.8} aria-hidden />
              <span className="text-xl font-semibold tracking-tight text-[#e07a3f] lowercase">
                ever<span className="text-[#e89660]">missed</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Creating beautiful spaces to honor and remember the people who have touched our lives.
              Because every life deserves to be celebrated.
            </p>
            <p className="mt-4 max-w-xs text-sm italic leading-relaxed text-slate-500">
              &ldquo;Those we love don&apos;t go away, they walk beside us every day.&rdquo;
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold tracking-wide text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={`text-sm ${linkClass}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-600/60 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="sm:text-right">Made with care for families around the world.</p>
        </div>
      </div>
    </footer>
  );
}
