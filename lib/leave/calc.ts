/** 연차 계산 (순수 함수 — 서버/클라이언트/테스트 공용) */
import { toUtcMidnight } from "@/lib/datetime";
import { isDeductible, isHalfDay, type LeaveType } from "@/lib/leave/types";

/** 신규 사용자에게 기본 부여되는 연차 일수 */
export const DEFAULT_ANNUAL_DAYS = 15;

/** 토·일 여부 (UTC 기준) */
export function isWeekend(d: Date): boolean {
  const day = d.getUTCDay(); // 0=일 … 6=토
  return day === 0 || day === 6;
}

/** start~end(양 끝 포함) 사이의 영업일(월~금)을 UTC 자정 Date 배열로 */
export function eachBusinessDay(start: Date, end: Date): Date[] {
  const s = toUtcMidnight(start);
  const e = toUtcMidnight(end);
  const out: Date[] = [];
  const cur = new Date(s);
  while (cur <= e) {
    if (!isWeekend(cur)) out.push(new Date(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/** start~end(양 끝 포함) 사이의 영업일(월~금) 수 */
export function businessDaysBetween(start: Date, end: Date): number {
  return eachBusinessDay(start, end).length;
}

/**
 * 신청 일수 계산.
 * - 연차 / 병가: 기간 내 영업일 수
 * - 반차: 0.5 (하루)
 */
export function computeLeaveDays(
  type: LeaveType,
  startDate: Date,
  endDate: Date,
): number {
  if (isHalfDay(type)) return 0.5;
  return businessDaysBetween(startDate, endDate);
}

export interface BalanceInput {
  grantedDays: number;
  adjustDays: number;
  /** 승인된(APPROVED) 신청들 */
  approvedRequests: { type: LeaveType; days: number }[];
}

export interface BalanceSummary {
  granted: number;
  used: number;
  remaining: number;
  sickUsed: number;
}

/** 사용자 1명의 특정 연도 연차 현황 계산 */
export function summarizeBalance(input: BalanceInput): BalanceSummary {
  let used = 0;
  let sickUsed = 0;
  for (const r of input.approvedRequests) {
    if (r.type === "SICK") {
      sickUsed += r.days;
    } else if (isDeductible(r.type)) {
      used += r.days;
    }
  }
  used = round2(used + input.adjustDays);
  const granted = round2(input.grantedDays);
  return {
    granted,
    used,
    remaining: round2(granted - used),
    sickUsed: round2(sickUsed),
  };
}

/** 소수 둘째 자리 반올림 (0.5 단위 연차 오차 방지) */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
