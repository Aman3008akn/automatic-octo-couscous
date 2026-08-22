import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "destructive";

const base =
  "inline-flex items-center justify-center rounded-card px-4 py-2 text-sm font-medium " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-navy-900 text-paper hover:bg-navy-600",
  secondary: "bg-navy-50 text-navy-900 hover:bg-navy-100",
  tertiary: "bg-transparent text-navy-900 hover:bg-navy-50",
  destructive: "bg-danger text-paper hover:opacity-90",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? "Working…" : children}
    </button>
  );
}
