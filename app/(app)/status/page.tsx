import { requireApprover } from "@/lib/auth/dal";
import { getMonthlyLeaveUsage } from "@/lib/status/queries";
import { clampMonth } from "@/lib/calendar/grid";
import { MonthPicker } from "@/components/month-picker";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyRow,
  RecordCard,
  RecordEmpty,
  RecordList,
  RecordRow,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  TypeBadge,
} from "@/components/ui";
import { daysNum, ymdKo } from "@/lib/datetime";

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireApprover();
  const sp = await searchParams;
  const now = new Date();

  const yParam = Number(sp.y);
  const mParam = Number(sp.m);
  const { y, m0 } = clampMonth(
    Number.isFinite(yParam) && yParam > 0 ? yParam : now.getUTCFullYear(),
    Number.isFinite(mParam) && mParam > 0 ? mParam : now.getUTCMonth() + 1,
  );

  const rows = await getMonthlyLeaveUsage(y, m0);
  const total = rows.reduce((sum, r) => sum + r.days, 0);
  const emptyText = "해당 월에 승인된 연차가 없습니다.";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MonthPicker basePath="/status" year={y} month0={m0} />
        <a href={`/status/export?y=${y}&m=${m0 + 1}`} download>
          <Button variant="outline" size="sm">
            엑셀(CSV) 다운로드
          </Button>
        </a>
      </div>

      <Card>
        <CardHeader
          title={`${y}년 ${m0 + 1}월 연차현황`}
          description={`승인 기준 · ${rows.length}건 · 합계 ${daysNum(total)}일 (마스터 제외)`}
        />
        <CardBody className="p-0">
          {rows.length === 0 ? (
            <RecordEmpty>{emptyText}</RecordEmpty>
          ) : (
            <RecordList>
              {rows.map((r, i) => (
                <RecordCard
                  key={`${r.userId}-${i}`}
                  title={r.name}
                  aside={<TypeBadge type={r.type} />}
                >
                  <RecordRow label="일자">{ymdKo(r.date)}</RecordRow>
                  <RecordRow label="사용일수">
                    <span className="tabular">{daysNum(r.days)}</span>
                  </RecordRow>
                </RecordCard>
              ))}
            </RecordList>
          )}
          <Table>
            <THead>
              <TR>
                <TH>이름</TH>
                <TH>일자</TH>
                <TH>종류</TH>
                <TH className="text-right">사용일수</TH>
              </TR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyRow colSpan={4}>{emptyText}</EmptyRow>
              ) : (
                rows.map((r, i) => (
                  <TR key={`${r.userId}-${i}`}>
                    <TD className="font-medium text-title">{r.name}</TD>
                    <TD className="whitespace-nowrap text-subtle">
                      {ymdKo(r.date)}
                    </TD>
                    <TD>
                      <TypeBadge type={r.type} />
                    </TD>
                    <TD className="tabular text-right">{daysNum(r.days)}</TD>
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
