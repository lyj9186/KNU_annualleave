import Link from "next/link";
import { requireApprover } from "@/lib/dal";
import {
  getRequestCounts,
  getRequestsForApproval,
} from "@/lib/queries";
import { Card, CardBody } from "@/components/ui";
import { RequestTable } from "@/components/request-table";
import { DecisionForm } from "./decision-form";
import { cn } from "@/lib/cn";
import {
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  type LeaveStatus,
  type LeaveType,
} from "@/lib/leave";

const STATUSES: LeaveStatus[] = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const TYPES: LeaveType[] = ["ANNUAL", "HALF_AM", "HALF_PM", "SICK"];

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireApprover();
  const sp = await searchParams;

  const status: LeaveStatus = STATUSES.includes(sp.status as LeaveStatus)
    ? (sp.status as LeaveStatus)
    : "PENDING";
  const type: LeaveType | undefined = TYPES.includes(sp.type as LeaveType)
    ? (sp.type as LeaveType)
    : undefined;

  const [counts, rows] = await Promise.all([
    getRequestCounts(),
    getRequestsForApproval({ status, type }),
  ]);

  const typeQuery = type ? `&type=${type}` : "";

  return (
    <div className="space-y-4">
      {/* 상태 탭 */}
      <div className="flex flex-wrap gap-1">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/approvals?status=${s}${typeQuery}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              status === s
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50",
            )}
          >
            {LEAVE_STATUS_LABELS[s]}
            <span
              className={cn(
                "ml-1.5 text-xs",
                status === s ? "text-blue-100" : "text-slate-400",
              )}
            >
              {counts[s]}
            </span>
          </Link>
        ))}
      </div>

      {/* 종류 필터 */}
      <div className="flex flex-wrap items-center gap-1 text-xs">
        <span className="mr-1 text-slate-500">종류</span>
        <FilterChip
          href={`/approvals?status=${status}`}
          active={!type}
          label="전체"
        />
        {TYPES.map((t) => (
          <FilterChip
            key={t}
            href={`/approvals?status=${status}&type=${t}`}
            active={type === t}
            label={LEAVE_TYPE_LABELS[t]}
          />
        ))}
      </div>

      <Card>
        <CardBody className="p-0">
          <RequestTable
            rows={rows}
            showUser
            showDecision={status !== "PENDING"}
            emptyText="해당 조건의 신청이 없습니다."
            actions={(r) => <DecisionForm requestId={r.id} status={r.status} />}
          />
        </CardBody>
      </Card>
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-2.5 py-1",
        active
          ? "bg-slate-800 text-white"
          : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50",
      )}
    >
      {label}
    </Link>
  );
}
