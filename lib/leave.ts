/**
 * 연차 도메인 로직 (순수 함수 — 서버/클라이언트/테스트 공용)
 */
import { LeaveStatus, LeaveType, Role } from "@/lib/generated/prisma/enums";

export { LeaveStatus, LeaveType, Role };

/** 신규 사용자에게 기본 부여되는 연차 일수 */
export const DEFAULT_ANNUAL_DAYS = 15;

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL: "연차",
  HALF_AM: "오전 반차",
  HALF_PM: "오후 반차",
  SICK: "병가",
};

export const LEAVE_TYPE_SHORT: Record<LeaveType, string> = {
  ANNUAL: "연차",
  HALF_AM: "오전반차",
  HALF_PM: "오후반차",
  SICK: "병가",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELLED: "취소",
};

export const ROLE_LABELS: Record<Role, string> = {
  MASTER: "마스터",
  TEAM_LEAD: "팀장",
  USER: "사용자",
};

/** 반차 여부 */
export function isHalfDay(type: LeaveType): boolean {
  return type === "HALF_AM" || type === "HALF_PM";
}

/** 연차에서 차감되는 종류인지 (병가는 차감하지 않음) */
export function isDeductible(type: LeaveType): boolean {
  return type !== "SICK";
}

/** UTC 기준 요일 (0=일 … 6=토) */
function utcDay(d: Date): number {
  return d.getUTCDay();
}

function isWeekend(d: Date): boolean {
  const day = utcDay(d);
  return day === 0 || day === 6;
}

/** start~end(양 끝 포함) 사이의 영업일(월~금) 수 */
export function businessDaysBetween(start: Date, end: Date): number {
  const s = toUtcMidnight(start);
  const e = toUtcMidnight(end);
  if (e < s) return 0;
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    if (!isWeekend(cur)) count += 1;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

/** 시분초를 버리고 UTC 자정으로 정규화 */
export function toUtcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
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

/** 신청이 특정 연도에 속하는지 (시작일 기준) */
export function leaveYear(startDate: Date): number {
  return startDate.getUTCFullYear();
}
