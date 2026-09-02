import "server-only";

import type { LeaveStatus, LeaveType } from "@/lib/leave/types";

/** 화면 표시용 연차 신청 DTO */
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

/** Prisma select — RequestRow 를 만들기 위한 최소 필드 */
export const requestSelect = {
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

type RequestSelectPayload = {
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
};

export function toRequestRow(r: RequestSelectPayload): RequestRow {
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
