import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 모바일 레코드 리스트 — 좁은 화면에서 테이블 행을 대체한다.
 * 데스크톱(`lg` 이상)에서는 숨기고 `<Table>` 을 노출하는 패턴으로 사용.
 *
 *   <div className="hidden lg:block"><Table>…</Table></div>
 *   <RecordList>{rows.map(r => <RecordCard …/>)}</RecordList>
 */
export function RecordList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <ul className={cn("divide-y divide-line lg:hidden", className)}>
      {children}
    </ul>
  );
}

/** 리스트가 비었을 때의 안내 (RecordList 와 같은 브레이크포인트) */
export function RecordEmpty({ children }: { children?: ReactNode }) {
  return (
    <p className="px-4 py-10 text-center text-sm text-faint lg:hidden">
      {children ?? "데이터가 없습니다."}
    </p>
  );
}

export function RecordCard({
  title,
  aside,
  children,
  footer,
  className,
}: {
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("px-4 py-3.5", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 text-[15px] font-semibold text-title">
          {title}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      <dl className="mt-2 space-y-1.5">{children}</dl>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </li>
  );
}

/** 레코드 카드 안의 라벨/값 한 줄 */
export function RecordRow({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right text-body">{children}</dd>
    </div>
  );
}
