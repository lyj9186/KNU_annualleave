"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui";
import { LEAVE_TYPES, LEAVE_TYPE_LABELS } from "@/lib/leave";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** 연차현황 조회 조건 — 연도·월 범위 · 이름 · 종류. 바뀌면 `/status?…` 로 이동. */
export function StatusFilters({
  members,
  years,
  year,
  fromMonth,
  toMonth,
  userId,
  type,
}: {
  members: { id: string; name: string }[];
  years: number[];
  year: number;
  fromMonth: number;
  toMonth: number;
  userId: string;
  type: string;
}) {
  const router = useRouter();

  const push = (next: {
    year?: number;
    fromMonth?: number;
    toMonth?: number;
    userId?: string;
    type?: string;
  }) => {
    const y = next.year ?? year;
    let from = next.fromMonth ?? fromMonth;
    let to = next.toMonth ?? toMonth;
    // 범위가 뒤집히면 맞춰준다
    if (next.fromMonth !== undefined && from > to) to = from;
    if (next.toMonth !== undefined && to < from) from = to;
    const q = new URLSearchParams({
      y: String(y),
      from: String(from),
      to: String(to),
      user: next.userId ?? userId,
      type: next.type ?? type,
    });
    router.push(`/status?${q.toString()}`);
  };

  const group = "flex items-center gap-1.5";
  const label = "text-xs font-medium text-muted";
  const sel = "h-9 w-auto";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className={group}>
        <span className={label}>기간</span>
        <Select
          aria-label="연도"
          className={sel}
          value={year}
          onChange={(e) => push({ year: Number(e.target.value) })}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </Select>
        <Select
          aria-label="시작 월"
          className={sel}
          value={fromMonth}
          onChange={(e) => push({ fromMonth: Number(e.target.value) })}
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </Select>
        <span className="text-faint">~</span>
        <Select
          aria-label="종료 월"
          className={sel}
          value={toMonth}
          onChange={(e) => push({ toMonth: Number(e.target.value) })}
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </Select>
      </div>

      <div className={group}>
        <span className={label}>이름</span>
        <Select
          aria-label="이름"
          className={sel}
          value={userId}
          onChange={(e) => push({ userId: e.target.value })}
        >
          <option value="">전체</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </div>

      <div className={group}>
        <span className={label}>종류</span>
        <Select
          aria-label="종류"
          className={sel}
          value={type}
          onChange={(e) => push({ type: e.target.value })}
        >
          <option value="">전체</option>
          {LEAVE_TYPES.map((t) => (
            <option key={t} value={t}>
              {LEAVE_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
