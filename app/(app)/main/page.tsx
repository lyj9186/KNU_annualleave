import { requireUser } from "@/lib/dal";
import { getMonthLeaves, getYearOverview } from "@/lib/queries";
import { clampMonth } from "@/lib/calendar";
import { CalendarMonth } from "@/components/calendar-month";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR, EmptyRow } from "@/components/ui/table";
import { RoleBadge } from "@/components/ui/badge";
import { daysNum } from "@/lib/format";
import { cn } from "@/lib/cn";

export default async function MainPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const sp = await searchParams;
  const now = new Date();

  const yParam = Number(sp.y);
  const mParam = Number(sp.m);
  const { y, m0 } = clampMonth(
    Number.isFinite(yParam) && yParam > 0 ? yParam : now.getUTCFullYear(),
    Number.isFinite(mParam) && mParam > 0 ? mParam : now.getUTCMonth() + 1,
  );

  const [leaves, overview] = await Promise.all([
    getMonthLeaves(y, m0),
    getYearOverview(y),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <CalendarMonth year={y} month0={m0} leaves={leaves} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={`${y}년 연차 현황`}
          description="가용 · 사용 · 잔여 (연차 −1일, 반차 −0.5일, 병가 미차감)"
        />
        <CardBody className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>이름</TH>
                <TH>구분</TH>
                <TH className="text-right">가용연차</TH>
                <TH className="text-right">사용연차</TH>
                <TH className="text-right">잔여연차</TH>
                <TH className="text-right">승인대기</TH>
                <TH className="text-right">병가사용</TH>
              </TR>
            </THead>
            <TBody>
              {overview.length === 0 ? (
                <EmptyRow colSpan={7} />
              ) : (
                overview.map((row) => (
                  <TR key={row.userId}>
                    <TD className="font-medium text-slate-800">{row.name}</TD>
                    <TD>
                      <RoleBadge role={row.role} />
                    </TD>
                    <TD className="tabular text-right">
                      {daysNum(row.summary.granted)}
                    </TD>
                    <TD className="tabular text-right">
                      {daysNum(row.summary.used)}
                    </TD>
                    <TD
                      className={cn(
                        "tabular text-right font-semibold",
                        row.summary.remaining < 0
                          ? "text-rose-600"
                          : "text-slate-800",
                      )}
                    >
                      {daysNum(row.summary.remaining)}
                    </TD>
                    <TD className="tabular text-right text-amber-600">
                      {row.pendingDays > 0 ? daysNum(row.pendingDays) : "-"}
                    </TD>
                    <TD className="tabular text-right text-slate-500">
                      {row.summary.sickUsed > 0
                        ? daysNum(row.summary.sickUsed)
                        : "-"}
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
