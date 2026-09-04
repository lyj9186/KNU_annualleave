import "server-only";

import { db } from "@/lib/db";
import { isKrHoliday } from "@/lib/holidays/kr";
import type { LeaveType } from "@/lib/leave/types";
import { expandLeaveUsage } from "./expand";
import type { LeaveUsageRow } from "./types";

export interface LeaveUsageFilter {
  year: number;
  /** 시작월 1-12 */
  fromMonth: number;
  /** 종료월 1-12 (fromMonth 이상) */
  toMonth: number;
  /** 특정 사용자만 (없으면 전체) */
  userId?: string;
  /** 특정 종류만 (없으면 전체) */
  type?: LeaveType;
}

/**
 * 지정 월 범위의 승인된 연차를 하루 단위로 펼친 목록.
 * 마스터는 연차를 사용하지 않으므로 제외한다. 주말·공휴일은 집계하지 않는다.
 */
export async function getLeaveUsage(
  f: LeaveUsageFilter,
): Promise<LeaveUsageRow[]> {
  const rangeStart = new Date(Date.UTC(f.year, f.fromMonth - 1, 1));
  const rangeEnd = new Date(Date.UTC(f.year, f.toMonth, 0)); // 종료월 말일

  const rows = await db.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: rangeEnd },
      endDate: { gte: rangeStart },
      ...(f.type ? { type: f.type } : {}),
      user: {
        role: { not: "MASTER" },
        ...(f.userId ? { id: f.userId } : {}),
      },
    },
    select: {
      type: true,
      startDate: true,
      endDate: true,
      user: { select: { id: true, name: true, role: true } },
    },
  });

  return expandLeaveUsage(
    rows.map((r) => ({
      userId: r.user.id,
      name: r.user.name,
      role: r.user.role,
      type: r.type,
      startDate: r.startDate,
      endDate: r.endDate,
    })),
    rangeStart,
    rangeEnd,
    isKrHoliday,
  );
}
