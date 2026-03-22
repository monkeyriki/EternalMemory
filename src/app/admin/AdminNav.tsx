"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/store", label: "Store Items" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/ads", label: "Ads" },
  { href: "/admin/settings", label: "Settings" }
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto p-2 md:block md:p-0">
      {links.map((l) => {
        const active =
          pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors md:block ${
              active
                ? "bg-amber-600 text-white"
                : "text-slate-200 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

