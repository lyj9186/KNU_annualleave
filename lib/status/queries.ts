import "server-only";

import { db } from "@/lib/db";
import { expandLeaveUsage } from "./expand";
import type { LeaveUsageRow } from "./types";

/**
 * 특정 월(0-based)의 승인된 연차를 하루 단위로 펼친 목록.
 * 마스터는 연차를 사용하지 않으므로 제외한다.
 */
export async function getMonthlyLeaveUsage(
  year: number,
  month0: number,
): Promise<LeaveUsageRow[]> {
  const monthStart = new Date(Date.UTC(year, month0, 1));
  const monthEnd = new Date(Date.UTC(year, month0 + 1, 0)); // 말일

  const rows = await db.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
      user: { role: { not: "MASTER" } },
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
    year,
    month0,
  );
}
