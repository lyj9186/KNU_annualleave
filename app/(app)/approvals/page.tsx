import { requireApprover } from "@/lib/auth/dal";
import {
  getRequestCounts,
  getRequestsForApproval,
} from "@/lib/approvals/queries";
import { Card, CardBody, ChipLink } from "@/components/ui";
import { RequestTable } from "@/components/request-table";
import { DecisionForm } from "./decision-form";
import { cn } from "@/lib/cn";
import {
  LEAVE_STATUSES,
  LEAVE_STATUS_LABELS,
  LEAVE_TYPES,
  LEAVE_TYPE_LABELS,
  type LeaveStatus,
  type LeaveType,
} from "@/lib/leave";

function pick<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireApprover();
  const sp = await searchParams;

  const status: LeaveStatus = pick(sp.status, LEAVE_STATUSES) ?? "PENDING";
  const type: LeaveType | undefined = pick(sp.type, LEAVE_TYPES);

  const [counts, rows] = await Promise.all([
    getRequestCounts(),
    getRequestsForApproval({ status, type }),
  ]);

  const typeQuery = type ? `&type=${type}` : "";

  return (
    <div className="space-y-4">
      {/* 상태 탭 */}
      <div className="flex flex-wrap gap-1">
        {LEAVE_STATUSES.map((s) => (
          <ChipLink
            key={s}
            variant="tab"
            active={status === s}
            href={`/approvals?status=${s}${typeQuery}`}
          >
            {LEAVE_STATUS_LABELS[s]}
            <span
              className={cn(
                "ml-1.5 text-xs",
                status === s ? "text-blue-100" : "text-faint",
              )}
            >
              {counts[s]}
            </span>
          </ChipLink>
        ))}
      </div>

      {/* 종류 필터 */}
      <div className="flex flex-wrap items-center gap-1 text-xs">
        <span className="mr-1 text-muted">종류</span>
        <ChipLink
          variant="filter"
          active={!type}
          href={`/approvals?status=${status}`}
        >
          전체
        </ChipLink>
        {LEAVE_TYPES.map((t) => (
          <ChipLink
            key={t}
            variant="filter"
            active={type === t}
            href={`/approvals?status=${status}&type=${t}`}
          >
            {LEAVE_TYPE_LABELS[t]}
          </ChipLink>
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
