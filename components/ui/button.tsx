import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover disabled:bg-blue-300",
  secondary: "bg-slate-800 text-white hover:bg-slate-900 disabled:bg-slate-400",
  outline:
    "border border-line-strong bg-surface text-body hover:bg-surface-muted disabled:opacity-50",
  ghost: "text-subtle hover:bg-slate-100 disabled:opacity-50",
  danger: "bg-danger text-white hover:bg-rose-700 disabled:bg-rose-300",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
