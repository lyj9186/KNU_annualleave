import "server-only";

import { db } from "@/lib/db";
import { yearRange } from "@/lib/datetime";
import { buildBalancesByUser } from "@/lib/balance";
import {
  ROLE_ORDER,
  USER_STATUS_ORDER,
  type Role,
  type UserStatus,
} from "@/lib/leave/types";
import type { BalanceSummary } from "@/lib/leave/calc";
import {
  requestSelect,
  toRequestRow,
  type RequestRow,
} from "@/lib/leave/request";

const userCard = {
  id: true,
  loginId: true,
  name: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

export interface SettingsUserRow {
  id: string;
  loginId: string;
  name: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  summary: BalanceSummary;
}

/** 연차설정 목록: 전체 사용자 + 해당 연도 요약 */
export async function getAllUsersForSettings(
  year: number,
): Promise<SettingsUserRow[]> {
  const { start, end } = yearRange(year);
  const [users, balances, approved] = await Promise.all([
    db.user.findMany({ select: userCard }),
    db.leaveBalance.findMany({ where: { year } }),
    db.leaveRequest.findMany({
      where: { status: "APPROVED", startDate: { gte: start, lt: end } },
      select: { userId: true, type: true, days: true, status: true },
    }),
  ]);

  const byUser = buildBalancesByUser(
    users.map((u) => u.id),
    balances,
    approved,
  );

  return users
    .map((u) => ({ ...u, summary: byUser.get(u.id)!.summary }))
    .sort(
      (a, b) =>
        USER_STATUS_ORDER[a.status] - USER_STATUS_ORDER[b.status] ||
        ROLE_ORDER[a.role] - ROLE_ORDER[b.role] ||
        a.name.localeCompare(b.name, "ko"),
    );
}

export interface UserDetail {
  user: {
    id: string;
    loginId: string;
    name: string;
    role: Role;
    status: UserStatus;
    createdAt: Date;
  };
  balances: {
    id: string;
    year: number;
    grantedDays: number;
    adjustDays: number;
  }[];
  requests: RequestRow[];
}

/** 연차설정 상세: 사용자 1명 + 연도별 balance + 신청 내역 */
export async function getUserDetail(
  userId: string,
): Promise<UserDetail | null> {
  const [user, balances, requests] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: userCard }),
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
