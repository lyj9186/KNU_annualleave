import "server-only";

import { db } from "@/lib/db";
import { yearRange } from "@/lib/datetime";
import {
  DEFAULT_ANNUAL_DAYS,
  summarizeBalance,
  type BalanceSummary,
} from "@/lib/leave/calc";
import { ROLE_ORDER, type Role } from "@/lib/leave/types";
import { requestSelect, toRequestRow, type RequestRow } from "@/lib/leave/request";

export interface ProxyTarget {
  id: string;
  name: string;
  role: Role;
}

/** 마스터 대리 등록 대상 후보 (활성 · 마스터 제외, 팀장 → 사용자 순) */
export async function getProxyTargets(): Promise<ProxyTarget[]> {
  const users = await db.user.findMany({
    where: { status: "ACTIVE", role: { not: "MASTER" } },
    select: { id: true, name: true, role: true },
  });
  return users.sort(
    (a, b) =>
      ROLE_ORDER[a.role] - ROLE_ORDER[b.role] ||
      a.name.localeCompare(b.name, "ko"),
  );
}

/** 특정 사용자의 신청 내역 (최근순) */
export async function getUserRequests(userId: string): Promise<RequestRow[]> {
  const rows = await db.leaveRequest.findMany({
    where: { userId },
    select: requestSelect,
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toRequestRow);
}

/** 특정 사용자의 특정 연도 연차 요약 */
export async function getUserYearSummary(
  userId: string,
  year: number,
): Promise<BalanceSummary> {
  const { start, end } = yearRange(year);
  const [balance, approved] = await Promise.all([
    db.leaveBalance.findUnique({ where: { userId_year: { userId, year } } }),
    db.leaveRequest.findMany({
      where: { userId, status: "APPROVED", startDate: { gte: start, lt: end } },
      select: { type: true, days: true },
    }),
  ]);
  return summarizeBalance({
    grantedDays: balance?.grantedDays ?? DEFAULT_ANNUAL_DAYS,
    adjustDays: balance?.adjustDays ?? 0,
    approvedRequests: approved,
  });
}
