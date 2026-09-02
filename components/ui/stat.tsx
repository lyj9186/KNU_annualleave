import { cn } from "@/lib/cn";

/** `<dl>` 안에서 쓰는 통계 셀 (레이블 + 값) */
export function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md bg-surface-muted py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd
        className={cn(
          "tabular mt-1 text-lg font-bold",
          accent ? "text-danger" : "text-title",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
