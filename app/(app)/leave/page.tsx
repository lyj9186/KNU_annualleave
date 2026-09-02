import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { getUserRequests, getUserYearSummary } from "@/lib/leave/queries";
import { Card, CardBody, CardHeader, Button, Stat } from "@/components/ui";
import { RequestTable } from "@/components/request-table";
import { LeaveForm } from "./leave-form";
import { withdrawLeaveRequest } from "@/lib/leave/actions";
import { daysNum } from "@/lib/datetime";

export default async function LeavePage() {
  const user = await requireUser();
  if (user.role === "MASTER") redirect("/main");
  const year = new Date().getUTCFullYear();

  const [summary, requests] = await Promise.all([
    getUserYearSummary(user.id, year),
    getUserRequests(user.id),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader title={`${year}년 내 연차`} />
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
            {summary.sickUsed > 0 ? (
              <p className="mt-3 text-center text-xs text-muted">
                병가 사용 {daysNum(summary.sickUsed)}일 (연차 미차감)
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="연차 등록" description="신청 후 팀장 승인이 필요합니다." />
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
