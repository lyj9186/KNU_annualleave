/**
 * 날짜 유틸 (순수 함수 — 서버/클라이언트/테스트 공용).
 *
 * 규칙: DB 의 `@db.Date` 값은 항상 UTC 자정으로 다룬다.
 *       화면 표시·비교는 `getUTC*` 기준. 단, 사용자의 "오늘"(입력 기본값·
 *       달력 강조)만 로컬 타임존을 쓴다 — `todayIso()`.
 */

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Date → "2026-03-05" (UTC 기준) */
export function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Date → "2026-03-05 (목)" (UTC 기준) */
export function ymdKo(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate(),
  )} (${WEEKDAYS[d.getUTCDay()]})`;
}

/** 기간 표시: 같은 날이면 하루만 */
export function rangeKo(start: Date, end: Date): string {
  return ymd(start) === ymd(end)
    ? ymdKo(start)
    : `${ymdKo(start)} ~ ${ymdKo(end)}`;
}

/** 일수 표시: 1, 0.5, 2.5 … + "일" */
export function daysKo(n: number): string {
  return `${daysNum(n)}일`;
}

/** 일수 숫자만: "1", "0.5" */
export function daysNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** "YYYY-MM-DD" → UTC 자정 Date */
export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** 시분초를 버리고 UTC 자정으로 정규화 */
export function toUtcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** 오늘 날짜를 로컬 타임존 기준 "YYYY-MM-DD" 로 */
export function todayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** 특정 연도의 [1월 1일, 다음 해 1월 1일) UTC 범위 */
export function yearRange(year: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year + 1, 0, 1)),
  };
}
