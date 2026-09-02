import { requireUser } from "@/lib/auth/dal";
import { getMonthLeaves, getYearOverview } from "@/lib/dashboard/queries";
import { clampMonth } from "@/lib/calendar/grid";
import { CalendarMonth } from "@/components/calendar-month";
import { BalanceCells } from "@/components/balance-cells";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  EmptyRow,
  RoleBadge,
  RecordList,
  RecordEmpty,
  RecordCard,
  RecordRow,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { daysNum } from "@/lib/datetime";

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
          <CalendarMonth
            key={`${y}-${m0}`}
            year={y}
            month0={m0}
            leaves={leaves}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={`${y}년 연차 현황`}
          description="가용 · 사용 · 잔여 (연차 −1일, 반차 −0.5일, 병가 미차감)"
        />
        <CardBody className="p-0">
          {overview.length === 0 ? (
            <RecordEmpty />
          ) : (
            <RecordList>
              {overview.map((row) => (
                <RecordCard
                  key={row.userId}
                  title={row.name}
                  aside={<RoleBadge role={row.role} />}
                >
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {(
                      [
                        ["가용", daysNum(row.summary.granted), "text-title"],
                        ["사용", daysNum(row.summary.used), "text-title"],
                        [
                          "잔여",
                          daysNum(row.summary.remaining),
                          row.summary.remaining < 0
                            ? "text-danger"
                            : "text-title",
                        ],
                      ] as const
                    ).map(([label, value, tone]) => (
                      <div
                        key={label}
                        className="rounded-md bg-surface-muted py-1.5"
                      >
                        <dt className="text-xs text-muted">{label}</dt>
                        <dd
                          className={cn(
                            "tabular mt-0.5 text-sm font-semibold",
                            tone,
                          )}
                        >
                          {value}
                        </dd>
                      </div>
                    ))}
                  </div>
                  {row.pendingDays > 0 ? (
                    <RecordRow label="승인대기">
                      <span className="tabular text-amber-600">
                        {daysNum(row.pendingDays)}
                      </span>
                    </RecordRow>
                  ) : null}
                  {row.summary.sickUsed > 0 ? (
                    <RecordRow label="병가사용">
                      <span className="tabular">
                        {daysNum(row.summary.sickUsed)}
                      </span>
                    </RecordRow>
                  ) : null}
                </RecordCard>
              ))}
            </RecordList>
          )}
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
                    <TD className="font-medium text-title">{row.name}</TD>
                    <TD>
                      <RoleBadge role={row.role} />
                    </TD>
                    <BalanceCells summary={row.summary} />
                    <TD className="tabular text-right text-amber-600">
                      {row.pendingDays > 0 ? daysNum(row.pendingDays) : "-"}
                    </TD>
                    <TD className="tabular text-right text-muted">
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
