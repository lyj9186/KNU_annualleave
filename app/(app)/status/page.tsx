import { requireApprover } from "@/lib/auth/dal";
import { getActiveMembers } from "@/lib/leave/queries";
import { getLeaveUsage } from "@/lib/status/queries";
import { StatusFilters } from "./status-filters";
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
import { LEAVE_TYPES, LEAVE_TYPE_LABELS, type LeaveType } from "@/lib/leave";

/** 1-12 범위로 정규화, 아니면 fallback */
function month(raw: string | string[] | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : fallback;
}

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireApprover();
  const sp = await searchParams;
  const now = new Date();

  const yRaw = Number(sp.y);
  const year =
    Number.isInteger(yRaw) && yRaw >= 2000 && yRaw <= 2100
      ? yRaw
      : now.getUTCFullYear();
  const curMonth = now.getUTCMonth() + 1;
  const fromMonth = month(sp.from, curMonth);
  const toMonth = Math.max(fromMonth, month(sp.to, fromMonth));

  const userId = typeof sp.user === "string" ? sp.user : "";
  const type: LeaveType | "" =
    typeof sp.type === "string" && (LEAVE_TYPES as string[]).includes(sp.type)
      ? (sp.type as LeaveType)
      : "";

  const members = await getActiveMembers();
  const validUserId = members.some((m) => m.id === userId) ? userId : "";

  const rows = await getLeaveUsage({
    year,
    fromMonth,
    toMonth,
    userId: validUserId || undefined,
    type: type || undefined,
  });
  const total = rows.reduce((sum, r) => sum + r.days, 0);

  const period =
    fromMonth === toMonth ? `${fromMonth}월` : `${fromMonth}~${toMonth}월`;
  const memberName = members.find((m) => m.id === validUserId)?.name;
  const cond = [
    memberName ?? "전체",
    type ? LEAVE_TYPE_LABELS[type] : "전체",
  ].join(" · ");
  const emptyText = "해당 조건에 승인된 연차가 없습니다.";

  const exportQuery = new URLSearchParams({
    y: String(year),
    from: String(fromMonth),
    to: String(toMonth),
    user: validUserId,
    type,
  }).toString();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusFilters
          members={members}
          years={[year - 2, year - 1, year, year + 1, year + 2]}
          year={year}
          fromMonth={fromMonth}
          toMonth={toMonth}
          userId={validUserId}
          type={type}
        />
        <a href={`/status/export?${exportQuery}`} download>
          <Button variant="outline" size="sm">
            엑셀(CSV) 다운로드
          </Button>
        </a>
      </div>

      <Card>
        <CardHeader
          title={`${year}년 ${period} 연차현황`}
          description={`승인 기준 · ${cond} · ${rows.length}건 · 합계 ${daysNum(total)}일 (마스터·주말·공휴일 제외)`}
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
