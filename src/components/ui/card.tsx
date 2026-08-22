import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "bordered";
}

export function Card({ variant = "default", className, children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-card p-6 transition-all",
        variant === "default" && "bg-white border border-line shadow-sm",
        variant === "muted" && "bg-navy-50/50 border border-line/60",
        variant === "bordered" && "bg-transparent border border-line",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mb-4 flex flex-col gap-1", className)} {...rest}>{children}</div>;
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx("text-lg font-semibold text-ink", className)} {...rest}>{children}</h3>;
}

export function CardDescription({ className, children, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx("text-sm text-navy-600", className)} {...rest}>{children}</p>;
}

export function CardContent({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("flex-1", className)} {...rest}>{children}</div>;
}

export function CardFooter({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mt-6 flex items-center gap-3 pt-4 border-t border-line", className)} {...rest}>{children}</div>;
}
