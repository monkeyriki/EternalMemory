import type { ReactNode } from "react";

type MaxWidth = "xl" | "2xl" | "3xl" | "5xl";

const maxWidthClass: Record<MaxWidth, string> = {
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "5xl": "max-w-5xl"
};

type MemorialPageShellProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  maxWidth?: MaxWidth;
  /** Extra margin above main content (default `mt-8`) */
  contentClassName?: string;
  children: ReactNode;
};

/**
 * Shared layout for memorial flows — matches landing (soft gradient, Playfair title via `font-serif` + CSS variable).
 */
export function MemorialPageShell({
  title,
  subtitle,
  eyebrow = "In loving memory",
  maxWidth = "5xl",
  contentClassName = "mt-8",
  children
}: MemorialPageShellProps) {
  return (
    <div className="relative min-h-[60vh] overflow-hidden px-4 py-10 sm:py-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-100/40 via-sky-50/15 to-transparent"
        aria-hidden
      />
      <div className={`relative mx-auto w-full ${maxWidthClass[maxWidth]}`}>
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-600">{eyebrow}</p>
        <h1 className="mt-3 text-center font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600 sm:text-lg">{subtitle}</p>
        ) : null}
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
}
