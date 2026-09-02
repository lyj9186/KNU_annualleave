import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * 데스크톱(`lg` 이상) 전용 데이터 테이블.
 * 좁은 화면에서는 숨겨지므로, 호출부는 `<RecordList>` 로 모바일 대체 뷰를 함께 제공한다.
 */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="hidden w-full overflow-x-auto lg:block">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      className={cn("bg-surface-muted text-xs text-muted", className)}
      {...props}
    />
  );
}

export function TBody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-b border-slate-100 last:border-0", className)}
      {...props}
    />
  );
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-3 py-2 text-left font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn("px-3 py-2 align-middle text-body", className)}
      {...props}
    />
  );
}

export function EmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children?: ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-3 py-8 text-center text-sm text-faint"
      >
        {children ?? "데이터가 없습니다."}
      </td>
    </tr>
  );
}
