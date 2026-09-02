import type { ReactNode } from "react";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  EmptyRow,
  StatusBadge,
  TypeBadge,
  RecordList,
  RecordEmpty,
  RecordCard,
  RecordRow,
} from "@/components/ui";
import type { RequestRow } from "@/lib/leave/request";
import { daysKo, rangeKo } from "@/lib/datetime";

export function RequestTable({
  rows,
  showUser = false,
  showDecision = true,
  actions,
  emptyText,
}: {
  rows: RequestRow[];
  showUser?: boolean;
  showDecision?: boolean;
  actions?: (row: RequestRow) => ReactNode;
  emptyText?: string;
}) {
  const cols = 5 + (showUser ? 1 : 0) + (showDecision ? 1 : 0) + (actions ? 1 : 0);
  return (
    <>
      {/* 모바일: 카드 리스트 */}
      {rows.length === 0 ? (
        <RecordEmpty>{emptyText}</RecordEmpty>
      ) : (
        <RecordList>
          {rows.map((r) => {
            const action = actions?.(r);
            return (
              <RecordCard
                key={r.id}
                title={
                  <span className="flex items-center gap-2">
                    <TypeBadge type={r.type} />
                    {showUser ? <span>{r.userName}</span> : null}
                  </span>
                }
                aside={<StatusBadge status={r.status} />}
                footer={action || undefined}
              >
                <RecordRow label="기간">{rangeKo(r.startDate, r.endDate)}</RecordRow>
                <RecordRow label="일수">
                  <span className="tabular">{daysKo(r.days)}</span>
                </RecordRow>
                {r.reason ? (
                  <RecordRow label="사유">{r.reason}</RecordRow>
                ) : null}
                {showDecision && r.deciderName ? (
                  <RecordRow label="처리">
                    {r.deciderName}
                    {r.decisionNote ? ` · ${r.decisionNote}` : ""}
                  </RecordRow>
                ) : null}
              </RecordCard>
            );
          })}
        </RecordList>
      )}

      {/* 데스크톱: 테이블 */}
      <Table>
        <THead>
          <TR>
            {showUser ? <TH>신청자</TH> : null}
            <TH>종류</TH>
            <TH>기간</TH>
            <TH className="text-right">일수</TH>
            <TH>사유</TH>
            <TH>상태</TH>
            {showDecision ? <TH>처리</TH> : null}
            {actions ? <TH className="text-right">관리</TH> : null}
          </TR>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={cols}>{emptyText}</EmptyRow>
          ) : (
            rows.map((r) => (
              <TR key={r.id}>
                {showUser ? (
                  <TD className="font-medium text-title">{r.userName}</TD>
                ) : null}
                <TD>
                  <TypeBadge type={r.type} />
                </TD>
                <TD className="whitespace-nowrap text-subtle">
                  {rangeKo(r.startDate, r.endDate)}
                </TD>
                <TD className="tabular text-right">{daysKo(r.days)}</TD>
                <TD
                  className="max-w-[220px] truncate text-muted"
                  title={r.reason ?? ""}
                >
                  {r.reason || "-"}
                </TD>
                <TD>
                  <StatusBadge status={r.status} />
                </TD>
                {showDecision ? (
                  <TD className="text-xs text-muted">
                    {r.deciderName ? (
                      <>
                        {r.deciderName}
                        {r.decisionNote ? ` · ${r.decisionNote}` : ""}
                      </>
                    ) : (
                      "-"
                    )}
                  </TD>
                ) : null}
                {actions ? <TD className="text-right">{actions(r)}</TD> : null}
              </TR>
            ))
          )}
        </TBody>
      </Table>
    </>
  );
}
