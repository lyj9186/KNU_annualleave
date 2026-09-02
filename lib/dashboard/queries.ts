import "server-only";

import { db } from "@/lib/db";
import { yearRange } from "@/lib/datetime";
import { buildBalancesByUser } from "@/lib/balance";
import { ROLE_ORDER, type LeaveType, type Role } from "@/lib/leave/types";
import type { BalanceSummary } from "@/lib/leave/calc";

export interface UserBalanceRow {
  userId: string;
  name: string;
  loginId: string;
  role: Role;
  summary: BalanceSummary;
  pendingDays: number;
}

/**
 * 특정 연도의 사용자별 연차 현황 (메인 하단 표).
 * 마스터는 연차를 사용하지 않으므로 항상 제외한다.
 * `onlyUserId` 를 주면 해당 사용자 1명만 (일반 사용자는 본인 현황만 조회).
 */
export async function getYearOverview(
  year: number,
  onlyUserId?: string,
): Promise<UserBalanceRow[]> {
  const { start, end } = yearRange(year);

  const [users, balances, requests] = await Promise.all([
    db.user.findMany({
      where: {
        status: "ACTIVE",
        role: { not: "MASTER" },
        ...(onlyUserId ? { id: onlyUserId } : {}),
      },
      select: { id: true, name: true, loginId: true, role: true },
    }),
    db.leaveBalance.findMany({ where: { year } }),
    db.leaveRequest.findMany({
      where: {
        status: { in: ["APPROVED", "PENDING"] },
        startDate: { gte: start, lt: end },
      },
      select: { userId: true, type: true, days: true, status: true },
    }),
  ]);

  const byUser = buildBalancesByUser(
    users.map((u) => u.id),
    balances,
    requests,
  );

  return users
    .map((u) => {
      const b = byUser.get(u.id)!;
      return {
        userId: u.id,
        name: u.name,
        loginId: u.loginId,
        role: u.role,
        pendingDays: b.pendingDays,
        summary: b.summary,
      };
    })
    .sort(
      (a, b) =>
        ROLE_ORDER[a.role] - ROLE_ORDER[b.role] ||
        a.name.localeCompare(b.name, "ko"),
    );
}

export interface CalendarLeave {
  id: string;
  userId: string;
  userName: string;
  type: LeaveType;
  status: "APPROVED" | "PENDING";
  startDate: Date;
  endDate: Date;
  days: number;
}

/** 특정 월과 겹치는 승인/대기 연차 (메인 상단 캘린더) */
export async function getMonthLeaves(
  year: number,
  month0: number,
): Promise<CalendarLeave[]> {
  const monthStart = new Date(Date.UTC(year, month0, 1));
  const monthEnd = new Date(Date.UTC(year, month0 + 1, 0)); // 말일

  const rows = await db.leaveRequest.findMany({
    where: {
      status: { in: ["APPROVED", "PENDING"] },
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
      user: { role: { not: "MASTER" } },
    },
    select: {
      id: true,
      userId: true,
      type: true,
      status: true,
      startDate: true,
      endDate: true,
      days: true,
      user: { select: { name: true } },
    },
    orderBy: [{ startDate: "asc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.user.name,
    type: r.type,
    status: r.status as "APPROVED" | "PENDING",
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
  }));
}
