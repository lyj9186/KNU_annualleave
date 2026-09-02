import "server-only";

import {
  DEFAULT_ANNUAL_DAYS,
  summarizeBalance,
  type BalanceSummary,
  type LeaveStatus,
  type LeaveType,
} from "@/lib/leave";

export interface BalanceRow {
  userId: string;
  grantedDays: number;
  adjustDays: number;
}

export interface BalanceRequest {
  userId: string;
  type: LeaveType;
  days: number;
  status: LeaveStatus;
}

export interface UserBalance {
  summary: BalanceSummary;
  /** 승인대기 중인 비-병가 신청 일수 합계 */
  pendingDays: number;
}

/**
 * 사용자별 연차 현황을 계산한다.
 * `requests` 는 대상 연도의 APPROVED (+ 선택적으로 PENDING) 신청.
 * PENDING 을 넘기지 않으면 모든 사용자의 `pendingDays` 는 0.
 */
export function buildBalancesByUser(
  userIds: string[],
  balances: BalanceRow[],
  requests: BalanceRequest[],
): Map<string, UserBalance> {
  const balanceByUser = new Map(balances.map((b) => [b.userId, b]));
  const approvedByUser = new Map<string, { type: LeaveType; days: number }[]>();
  const pendingByUser = new Map<string, number>();

  for (const r of requests) {
    if (r.status === "APPROVED") {
      const arr = approvedByUser.get(r.userId) ?? [];
      arr.push({ type: r.type, days: r.days });
      approvedByUser.set(r.userId, arr);
    } else if (r.status === "PENDING" && r.type !== "SICK") {
      pendingByUser.set(
        r.userId,
        (pendingByUser.get(r.userId) ?? 0) + r.days,
      );
    }
  }

  const result = new Map<string, UserBalance>();
  for (const userId of userIds) {
    const bal = balanceByUser.get(userId);
    result.set(userId, {
      pendingDays: pendingByUser.get(userId) ?? 0,
      summary: summarizeBalance({
        grantedDays: bal?.grantedDays ?? DEFAULT_ANNUAL_DAYS,
        adjustDays: bal?.adjustDays ?? 0,
        approvedRequests: approvedByUser.get(userId) ?? [],
      }),
    });
  }
  return result;
}
