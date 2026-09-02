import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function FormMessage({
  ok,
  children,
}: {
  ok?: boolean;
  children: ReactNode;
}) {
  if (!children) return null;
  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700",
      )}
    >
      {children}
    </p>
  );
}
