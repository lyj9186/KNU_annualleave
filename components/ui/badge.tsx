import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { LeaveStatus, LeaveType, Role, UserStatus } from "@/lib/leave";
import {
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_SHORT,
  ROLE_LABELS,
  USER_STATUS_LABELS,
} from "@/lib/leave";

function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** 카테고리 색상 팔레트 (중립 토큰이 아닌 의미색). */
export const LEAVE_STATUS_STYLE: Record<LeaveStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-600",
};

export const LEAVE_TYPE_STYLE: Record<LeaveType, string> = {
  ANNUAL: "bg-blue-100 text-blue-800",
  HALF_AM: "bg-sky-100 text-sky-800",
  HALF_PM: "bg-indigo-100 text-indigo-800",
  SICK: "bg-fuchsia-100 text-fuchsia-800",
  PUBLIC: "bg-teal-100 text-teal-800",
};

export const ROLE_STYLE: Record<Role, string> = {
  MASTER: "bg-purple-100 text-purple-800",
  TEAM_LEAD: "bg-teal-100 text-teal-800",
  USER: "bg-slate-100 text-slate-700",
};

export const USER_STATUS_TEXT_STYLE: Record<UserStatus, string> = {
  ACTIVE: "text-emerald-600",
  PENDING: "text-amber-600",
  DISABLED: "text-faint",
};

export function StatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <Pill className={LEAVE_STATUS_STYLE[status]}>
      {LEAVE_STATUS_LABELS[status]}
    </Pill>
  );
}

export function TypeBadge({ type }: { type: LeaveType }) {
  return <Pill className={LEAVE_TYPE_STYLE[type]}>{LEAVE_TYPE_SHORT[type]}</Pill>;
}

export function RoleBadge({ role }: { role: Role }) {
  return <Pill className={ROLE_STYLE[role]}>{ROLE_LABELS[role]}</Pill>;
}

/** 계정 상태 (배지 아닌 색상 텍스트) */
export function UserStatusText({ status }: { status: UserStatus }) {
  return (
    <span className={cn("text-xs font-medium", USER_STATUS_TEXT_STYLE[status])}>
      {USER_STATUS_LABELS[status]}
    </span>
  );
}
