import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed",
    secondary:
      "bg-white text-slate-900 border border-slate-300 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
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
