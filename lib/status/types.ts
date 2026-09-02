/** 월별 연차현황 — 클라이언트 공용 타입 */
import type { LeaveType, Role } from "@/lib/leave/types";

/** 승인된 연차를 하루 단위로 펼친 한 줄 */
export interface LeaveUsageRow {
  userId: string;
  name: string;
  role: Role;
  /** UTC 자정 */
  date: Date;
  type: LeaveType;
  /** 그 날 사용일수 (연차·병가 1, 반차 0.5) */
  days: number;
}
