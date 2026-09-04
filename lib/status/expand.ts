/** 월별 연차현황 계산 (순수 함수 — 서버/테스트 공용) */
import { toUtcMidnight } from "@/lib/datetime";
import { eachBusinessDay, type HolidayCheck } from "@/lib/leave/calc";
import { isHalfDay, ROLE_ORDER, type LeaveType, type Role } from "@/lib/leave/types";
import type { LeaveUsageRow } from "./types";

export interface LeaveUsageInput {
  userId: string;
  name: string;
  role: Role;
  type: LeaveType;
  /** `@db.Date` — UTC 자정 */
  startDate: Date;
  endDate: Date;
}

/**
 * 승인된 연차 신청들을 [rangeStart, rangeEnd] (양 끝 포함) 안의 하루 단위 행으로 펼친다.
 * - 반차: 해당일이 범위 안이면 1행(0.5). 주말·공휴일이어도 등록됐다면 표기.
 * - 그 외(연차·병가·공가): 범위로 자른 뒤 근무일마다 1행(1). `isHoliday` 주면 공휴일 제외.
 * 정렬: 일자 → 역할(마스터·팀장·사용자) → 이름(ko).
 */
export function expandLeaveUsage(
  reqs: LeaveUsageInput[],
  rangeStart: Date,
  rangeEnd: Date,
  isHoliday?: HolidayCheck,
): LeaveUsageRow[] {
  const start = toUtcMidnight(rangeStart);
  const end = toUtcMidnight(rangeEnd);
  const out: LeaveUsageRow[] = [];

  for (const r of reqs) {
    const base = { userId: r.userId, name: r.name, role: r.role, type: r.type };

    if (isHalfDay(r.type)) {
      const day = toUtcMidnight(r.startDate);
      if (day >= start && day <= end) {
        out.push({ ...base, date: day, days: 0.5 });
      }
      continue;
    }

    const from = r.startDate < start ? start : r.startDate;
    const to = r.endDate > end ? end : r.endDate;
    for (const day of eachBusinessDay(from, to, isHoliday)) {
      out.push({ ...base, date: day, days: 1 });
    }
  }

  out.sort(
    (a, b) =>
      a.date.getTime() - b.date.getTime() ||
      ROLE_ORDER[a.role] - ROLE_ORDER[b.role] ||
      a.name.localeCompare(b.name, "ko"),
  );
  return out;
}
