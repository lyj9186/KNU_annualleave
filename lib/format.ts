/** 표시용 포맷 헬퍼 (서버/클라이언트 공용) */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** Date → "2026-03-05" (UTC 기준) */
export function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Date → "2026.03.05 (목)" */
export function ymdKo(d: Date): string {
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(
    d.getUTCDate(),
  )} (${WEEKDAYS[d.getUTCDay()]})`;
}

/** 기간 표시: 같은 날이면 하루만 */
export function rangeKo(start: Date, end: Date): string {
  return ymd(start) === ymd(end) ? ymdKo(start) : `${ymdKo(start)} ~ ${ymdKo(end)}`;
}

/** 일수 표시: 1, 0.5, 2.5 … + "일" */
export function daysKo(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(1)}일`;
}

/** 숫자만 (단위 없이) */
export function daysNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export { WEEKDAYS };
