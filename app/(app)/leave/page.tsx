import { requireUser } from "@/lib/auth/dal";
import {
  getActiveMembers,
  getUserRequests,
  getUserYearSummary,
} from "@/lib/leave/queries";
import { Card, CardBody, CardHeader, Button, Stat } from "@/components/ui";
import { RequestTable } from "@/components/request-table";
import { LeaveForm } from "./leave-form";
import { ProxyTargetPicker } from "./target-picker";
import { withdrawLeaveRequest } from "@/lib/leave/actions";
import { daysNum } from "@/lib/datetime";
import type { BalanceSummary } from "@/lib/leave/calc";

/** 병가·공가 사용 안내 (연차 미차감) */
function ExemptNote({ summary }: { summary: BalanceSummary }) {
  const parts: string[] = [];
  if (summary.sickUsed > 0) parts.push(`병가 ${daysNum(summary.sickUsed)}일`);
  if (summary.publicUsed > 0) parts.push(`공가 ${daysNum(summary.publicUsed)}일`);
  if (parts.length === 0) return null;
  return (
    <p className="mt-3 text-center text-xs text-muted">
      {parts.join(" · ")} 사용 (연차 미차감)
    </p>
  );
}

function SummaryCard({
  title,
  summary,
}: {
  title: string;
  summary: BalanceSummary;
}) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <Stat label="가용" value={daysNum(summary.granted)} />
          <Stat label="사용" value={daysNum(summary.used)} />
          <Stat
            label="잔여"
            value={daysNum(summary.remaining)}
            accent={summary.remaining < 0}
          />
        </dl>
        <ExemptNote summary={summary} />
      </CardBody>
    </Card>
  );
}

export default async function LeavePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const year = new Date().getUTCFullYear();

  if (user.role === "MASTER") {
    return <MasterProxyView searchParams={searchParams} year={year} />;
  }

  const [summary, requests] = await Promise.all([
    getUserYearSummary(user.id, year),
    getUserRequests(user.id),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <SummaryCard title={`${year}년 내 연차`} summary={summary} />
        <Card>
          <CardHeader
            title="연차 등록"
            description="신청 후 팀장 승인이 필요합니다."
          />
          <CardBody>
            <LeaveForm />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="내 신청 내역" />
        <CardBody className="p-0">
          <RequestTable
            rows={requests}
            emptyText="신청 내역이 없습니다."
            actions={(r) =>
              r.status === "PENDING" ? (
                <form action={withdrawLeaveRequest}>
                  <input type="hidden" name="requestId" value={r.id} />
                  <Button type="submit" variant="outline" size="sm">
                    철회
                  </Button>
                </form>
              ) : null
            }
          />
        </CardBody>
      </Card>
    </div>
  );
}

/** 마스터: 다른 사용자의 연차를 대리 등록 (등록 즉시 승인) */
async function MasterProxyView({
  searchParams,
  year,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  year: number;
}) {
  const sp = await searchParams;
  const targets = await getActiveMembers();
  const target =
    typeof sp.userId === "string"
      ? (targets.find((t) => t.id === sp.userId) ?? null)
      : null;

  const data = target
    ? await Promise.all([
        getUserYearSummary(target.id, year),
        getUserRequests(target.id),
      ])
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="연차 대리 등록"
          description="대상자를 선택해 연차를 대신 등록합니다. 등록 즉시 승인 처리됩니다."
        />
        <CardBody>
          <ProxyTargetPicker targets={targets} current={target?.id ?? null} />
        </CardBody>
      </Card>

      {target && data ? (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <SummaryCard
              title={`${target.name} · ${year}년 연차`}
              summary={data[0]}
            />
            <Card>
              <CardHeader title={`${target.name} 연차 등록`} />
              <CardBody>
                <LeaveForm
                  key={target.id}
                  targetUserId={target.id}
                  targetName={target.name}
                />
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title={`${target.name} 신청 내역`} />
            <CardBody className="p-0">
              <RequestTable rows={data[1]} emptyText="신청 내역이 없습니다." />
            </CardBody>
          </Card>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-line-strong px-4 py-10 text-center text-sm text-muted">
          위에서 대상자를 선택하세요.
        </p>
      )}
    </div>
  );
}
