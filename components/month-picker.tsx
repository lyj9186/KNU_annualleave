"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Select } from "@/components/ui";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * 연도·월 드롭다운 + 이전/다음 이동. `basePath` 로 이동 경로를 정한다.
 * 메인 달력(`/main`)과 연차현황(`/status`)이 공유.
 */
export function MonthPicker({
  basePath,
  year,
  month0,
}: {
  basePath: string;
  year: number;
  month0: number;
}) {
  const router = useRouter();
  const go = (y: number, m1: number) => router.push(`${basePath}?y=${y}&m=${m1}`);

  const prev = month0 === 0 ? { y: year - 1, m: 12 } : { y: year, m: month0 };
  const next = month0 === 11 ? { y: year + 1, m: 1 } : { y: year, m: month0 + 2 };
  const years = [year - 2, year - 1, year, year + 1, year + 2];

  const btn =
    "flex h-9 items-center justify-center rounded-md border border-line-strong bg-surface text-subtle hover:bg-surface-muted";

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="이전 달"
        onClick={() => go(prev.y, prev.m)}
        className={cn(btn, "w-8")}
      >
        ‹
      </button>
      <Select
        aria-label="연도"
        value={year}
        onChange={(e) => go(Number(e.target.value), month0 + 1)}
        className="h-9 w-auto"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}년
          </option>
        ))}
      </Select>
      <Select
        aria-label="월"
        value={month0 + 1}
        onChange={(e) => go(year, Number(e.target.value))}
        className="h-9 w-auto"
      >
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            {m}월
          </option>
        ))}
      </Select>
      <button
        type="button"
        aria-label="다음 달"
        onClick={() => go(next.y, next.m)}
        className={cn(btn, "w-8")}
      >
        ›
      </button>
    </div>
  );
}
