import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  /** `accent` = warm CTA (memorial brand), avoids fighting Tailwind overrides */
  variant?: "primary" | "secondary" | "accent";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99]";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md shadow-slate-900/20 hover:shadow-lg hover:shadow-slate-900/30 focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400",
    secondary:
      "border border-slate-300 bg-white/95 text-slate-900 shadow-sm hover:border-slate-400 hover:bg-white focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
    accent:
      "bg-amber-700 text-white shadow-md shadow-amber-900/15 hover:bg-amber-600 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:bg-amber-300"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
