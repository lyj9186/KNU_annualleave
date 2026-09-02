import "server-only";

import { db } from "@/lib/db";
import type { LeaveStatus, LeaveType } from "@/lib/leave/types";
import {
  requestSelect,
  toRequestRow,
  type RequestRow,
} from "@/lib/leave/request";

/** 승인 페이지: 상태/종류 필터 */
export async function getRequestsForApproval(filter: {
  status?: LeaveStatus;
  type?: LeaveType;
}): Promise<RequestRow[]> {
  const rows = await db.leaveRequest.findMany({
    where: { status: filter.status, type: filter.type },
    select: requestSelect,
    orderBy:
      filter.status === "PENDING"
        ? [{ startDate: "asc" }]
        : [{ decidedAt: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toRequestRow);
}

/** 상태별 건수 (탭 배지) */
export async function getRequestCounts(): Promise<Record<LeaveStatus, number>> {
  const grouped = await db.leaveRequest.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const base: Record<LeaveStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    CANCELLED: 0,
  };
  for (const g of grouped) base[g.status] = g._count._all;
  return base;
}
