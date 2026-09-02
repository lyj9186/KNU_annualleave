import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const FIELD_BASE =
  "w-full rounded-md border border-line-strong bg-surface text-sm text-ink placeholder:text-faint focus:border-brand-ring focus:outline-none focus:ring-1 focus:ring-brand-ring disabled:bg-slate-100";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input className={cn(FIELD_BASE, "h-10 px-3", className)} {...props} />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea className={cn(FIELD_BASE, "px-3 py-2", className)} {...props} />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(FIELD_BASE, "h-10 px-2", className)} {...props} />
  );
}
