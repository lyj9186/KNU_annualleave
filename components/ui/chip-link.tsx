import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChipVariant = "tab" | "filter" | "plain";

const SHAPE: Record<ChipVariant, string> = {
  tab: "rounded-md px-3 py-2 text-sm font-medium sm:py-1.5",
  filter: "rounded-full px-3 py-1.5 text-sm sm:px-2.5 sm:py-1 sm:text-xs",
  plain:
    "rounded-md border border-line-strong bg-surface px-2.5 py-1.5 text-xs text-subtle hover:bg-surface-muted sm:py-1",
};

const ACTIVE: Record<"tab" | "filter", string> = {
  tab: "bg-brand text-white",
  filter: "bg-slate-800 text-white",
};

const INACTIVE =
  "bg-surface text-subtle ring-1 ring-inset ring-line hover:bg-surface-muted";

/**
 * 필터/탭/이동용 링크 칩.
 * - `tab`    : 상태 탭 (승인 페이지)
 * - `filter` : 종류 필터 (승인 페이지)
 * - `plain`  : 이동 링크 (달력 월 이동) — active 무시
 */
export function ChipLink({
  href,
  variant,
  active = false,
  className,
  children,
}: {
  href: string;
  variant: ChipVariant;
  active?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        SHAPE[variant],
        variant !== "plain" && (active ? ACTIVE[variant] : INACTIVE),
        className,
      )}
    >
      {children}
    </Link>
  );
}
