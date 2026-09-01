import { cn } from "@/lib/cn";
import type { LeaveStatus, LeaveType, Role } from "@/lib/leave";
import { LEAVE_STATUS_LABELS, LEAVE_TYPE_SHORT, ROLE_LABELS } from "@/lib/leave";

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
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

const STATUS_STYLE: Record<LeaveStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-600",
};

const TYPE_STYLE: Record<LeaveType, string> = {
  ANNUAL: "bg-blue-100 text-blue-800",
  HALF_AM: "bg-sky-100 text-sky-800",
  HALF_PM: "bg-indigo-100 text-indigo-800",
  SICK: "bg-fuchsia-100 text-fuchsia-800",
};

const ROLE_STYLE: Record<Role, string> = {
  MASTER: "bg-purple-100 text-purple-800",
  TEAM_LEAD: "bg-teal-100 text-teal-800",
  USER: "bg-slate-100 text-slate-700",
};

export function StatusBadge({ status }: { status: LeaveStatus }) {
  return <Pill className={STATUS_STYLE[status]}>{LEAVE_STATUS_LABELS[status]}</Pill>;
}

export function TypeBadge({ type }: { type: LeaveType }) {
  return <Pill className={TYPE_STYLE[type]}>{LEAVE_TYPE_SHORT[type]}</Pill>;
}

export function RoleBadge({ role }: { role: Role }) {
  return <Pill className={ROLE_STYLE[role]}>{ROLE_LABELS[role]}</Pill>;
}
