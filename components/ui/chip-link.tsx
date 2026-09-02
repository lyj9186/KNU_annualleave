import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChipVariant = "tab" | "filter" | "plain";

const SHAPE: Record<ChipVariant, string> = {
  tab: "rounded-md px-3 py-1.5 text-sm font-medium",
  filter: "rounded-full px-2.5 py-1",
  plain:
    "rounded-md border border-line-strong bg-surface px-2.5 py-1 text-xs text-subtle hover:bg-surface-muted",
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
