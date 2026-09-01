import "server-only";

import { db } from "@/lib/db";
import {
  DEFAULT_ANNUAL_DAYS,
  summarizeBalance,
  type BalanceSummary,
  type LeaveStatus,
  type LeaveType,
} from "@/lib/leave";

const ROLE_ORDER = { MASTER: 0, TEAM_LEAD: 1, USER: 2 } as const;

export function yearRange(year: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

export interface UserBalanceRow {
  userId: string;
  name: string;
  loginId: string;
  role: "MASTER" | "TEAM_LEAD" | "USER";
  summary: BalanceSummary;
  pendingDays: number;
}

/** 특정 연도의 사용자별 연차 현황 (메인 하단 표) */
export async function getYearOverview(year: number): Promise<UserBalanceRow[]> {
  const { start, end } = yearRange(year);

  const [users, balances, requests] = await Promise.all([
    db.user.findMany({
      where: { status: "ACTIVE" },
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

  const balanceByUser = new Map(balances.map((b) => [b.userId, b]));
  const approvedByUser = new Map<string, { type: LeaveType; days: number }[]>();
  const pendingByUser = new Map<string, number>();

  for (const r of requests) {
    if (r.status === "APPROVED") {
      const arr = approvedByUser.get(r.userId) ?? [];
      arr.push({ type: r.type, days: r.days });
      approvedByUser.set(r.userId, arr);
    } else if (r.status === "PENDING" && r.type !== "SICK") {
      pendingByUser.set(r.userId, (pendingByUser.get(r.userId) ?? 0) + r.days);
    }
  }

  return users
    .map((u) => {
      const bal = balanceByUser.get(u.id);
      return {
        userId: u.id,
        name: u.name,
        loginId: u.loginId,
        role: u.role,
        pendingDays: pendingByUser.get(u.id) ?? 0,
        summary: summarizeBalance({
          grantedDays: bal?.grantedDays ?? DEFAULT_ANNUAL_DAYS,
          adjustDays: bal?.adjustDays ?? 0,
          approvedRequests: approvedByUser.get(u.id) ?? [],
        }),
      };
    })
    .sort(
      (a, b) =>
        ROLE_ORDER[a.role] - ROLE_ORDER[b.role] ||
        a.name.localeCompare(b.name, "ko"),
    );
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
      where: {
        userId,
        status: "APPROVED",
        startDate: { gte: start, lt: end },
      },
      select: { type: true, days: true },
    }),
  ]);
  return summarizeBalance({
    grantedDays: balance?.grantedDays ?? DEFAULT_ANNUAL_DAYS,
    adjustDays: balance?.adjustDays ?? 0,
    approvedRequests: approved,
  });
}

export interface RequestRow {
  id: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string | null;
  decisionNote: string | null;
  createdAt: Date;
  userName: string;
  deciderName: string | null;
}

const requestSelect = {
  id: true,
  type: true,
  status: true,
  startDate: true,
  endDate: true,
  days: true,
  reason: true,
  decisionNote: true,
  createdAt: true,
  user: { select: { name: true } },
  decidedBy: { select: { name: true } },
} as const;

function toRequestRow(r: {
  id: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string | null;
  decisionNote: string | null;
  createdAt: Date;
  user: { name: string };
  decidedBy: { name: string } | null;
}): RequestRow {
  return {
    id: r.id,
    type: r.type,
    status: r.status,
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
    reason: r.reason,
    decisionNote: r.decisionNote,
    createdAt: r.createdAt,
    userName: r.user.name,
    deciderName: r.decidedBy?.name ?? null,
  };
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

/** 승인 페이지: 상태/종류 필터 */
export async function getRequestsForApproval(filter: {
  status?: LeaveStatus;
  type?: LeaveType;
}): Promise<RequestRow[]> {
  const rows = await db.leaveRequest.findMany({
    where: {
      status: filter.status,
      type: filter.type,
    },
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

export interface SettingsUserRow {
  id: string;
  loginId: string;
  name: string;
  role: "MASTER" | "TEAM_LEAD" | "USER";
  status: "PENDING" | "ACTIVE" | "DISABLED";
  createdAt: Date;
  summary: BalanceSummary;
}

/** 연차설정 목록: 전체 사용자 + 해당 연도 요약 */
export async function getAllUsersForSettings(
  year: number,
): Promise<SettingsUserRow[]> {
  const { start, end } = yearRange(year);
  const [users, balances, approved] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    db.leaveBalance.findMany({ where: { year } }),
    db.leaveRequest.findMany({
      where: { status: "APPROVED", startDate: { gte: start, lt: end } },
      select: { userId: true, type: true, days: true },
    }),
  ]);

  const balByUser = new Map(balances.map((b) => [b.userId, b]));
  const apprByUser = new Map<string, { type: LeaveType; days: number }[]>();
  for (const r of approved) {
    const arr = apprByUser.get(r.userId) ?? [];
    arr.push({ type: r.type, days: r.days });
    apprByUser.set(r.userId, arr);
  }

  const statusOrder = { PENDING: 0, ACTIVE: 1, DISABLED: 2 } as const;

  return users
    .map((u) => ({
      ...u,
      summary: summarizeBalance({
        grantedDays: balByUser.get(u.id)?.grantedDays ?? DEFAULT_ANNUAL_DAYS,
        adjustDays: balByUser.get(u.id)?.adjustDays ?? 0,
        approvedRequests: apprByUser.get(u.id) ?? [],
      }),
    }))
    .sort(
      (a, b) =>
        statusOrder[a.status] - statusOrder[b.status] ||
        ROLE_ORDER[a.role] - ROLE_ORDER[b.role] ||
        a.name.localeCompare(b.name, "ko"),
    );
}

/** 연차설정 상세: 사용자 1명 + 연도별 balance */
export async function getUserDetail(userId: string) {
  const [user, balances, requests] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    db.leaveBalance.findMany({
      where: { userId },
      orderBy: { year: "desc" },
    }),
    db.leaveRequest.findMany({
      where: { userId },
      select: requestSelect,
      orderBy: [{ startDate: "desc" }],
      take: 50,
    }),
  ]);
  if (!user) return null;
  return { user, balances, requests: requests.map(toRequestRow) };
}

export interface CalendarLeave {
  id: string;
  userId: string;
  userName: string;
  type: LeaveType;
  status: Extract<LeaveStatus, "APPROVED" | "PENDING">;
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
