import { ymd } from "@/lib/datetime";

export interface DayCell {
  date: Date;
  iso: string; // YYYY-MM-DD
  inMonth: boolean;
  dow: number; // 0=일 … 6=토
}

/** 해당 월을 일요일 시작 7열 그리드로. 앞뒤 달 날짜로 채움. */
export function buildMonthGrid(year: number, month0: number): DayCell[][] {
  const first = new Date(Date.UTC(year, month0, 1));
  const lastOfMonth = new Date(Date.UTC(year, month0 + 1, 0));

  const cur = new Date(first);
  cur.setUTCDate(1 - first.getUTCDay()); // 첫 주 일요일로

  const weeks: DayCell[][] = [];
  while (weeks.length < 6) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        date: new Date(cur),
        iso: ymd(cur),
        inMonth: cur.getUTCMonth() === month0,
        dow: cur.getUTCDay(),
      });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    weeks.push(week);
    if (cur > lastOfMonth) break; // 이번 달 마지막 날을 포함한 주까지 렌더
  }
  return weeks;
}

/** day 가 [start,end] (양끝 포함, 일 단위) 범위에 들어가는지 */
export function coversDay(day: Date, start: Date, end: Date): boolean {
  const t = dayFloor(day);
  return t >= dayFloor(start) && t <= dayFloor(end);
}

function dayFloor(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** month1: 1-12 → 정규화된 {y, m0(0-11)} */
export function clampMonth(year: number, month1: number): { y: number; m0: number } {
  const base = year * 12 + (month1 - 1);
  return { y: Math.floor(base / 12), m0: ((base % 12) + 12) % 12 };
}
