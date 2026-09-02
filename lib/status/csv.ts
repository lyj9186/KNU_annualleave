/** 월별 연차현황 → 엑셀(CSV) 문자열 (순수 함수) */
import { daysNum, ymd } from "@/lib/datetime";
import { LEAVE_TYPE_SHORT } from "@/lib/leave/types";
import type { LeaveUsageRow } from "./types";

/** UTF-8 BOM (U+FEFF) — 엑셀에서 한글이 깨지지 않도록 맨 앞에 붙인다 */
const BOM = String.fromCharCode(0xfeff);
const HEADERS = ["이름", "일자", "종류", "사용일수"];

/** CSV 셀 이스케이프 (콤마·따옴표·개행 포함 시 큰따옴표로 감싼다) */
function cell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** 예: `홍길동,2026-09-02,오전반차,0.5` */
export function toLeaveUsageCsv(rows: LeaveUsageRow[]): string {
  const lines = [HEADERS.join(",")];
  for (const r of rows) {
    lines.push(
      [r.name, ymd(r.date), LEAVE_TYPE_SHORT[r.type], daysNum(r.days)]
        .map(cell)
        .join(","),
    );
  }
  return BOM + lines.join("\r\n") + "\r\n";
}
