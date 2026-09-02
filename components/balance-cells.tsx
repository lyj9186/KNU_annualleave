import { cn } from "@/lib/cn";
import { TD } from "@/components/ui";
import { daysNum } from "@/lib/datetime";
import type { BalanceSummary } from "@/lib/leave/calc";

/**
 * 잔여표의 가용/사용/잔여 3개 셀 (`<tr>` 안에서 사용).
 * 메인 현황표와 연차설정 목록이 공유.
 */
export function BalanceCells({ summary }: { summary: BalanceSummary }) {
  return (
    <>
      <TD className="tabular text-right">{daysNum(summary.granted)}</TD>
      <TD className="tabular text-right">{daysNum(summary.used)}</TD>
      <TD
        className={cn(
          "tabular text-right font-semibold",
          summary.remaining < 0 ? "text-danger" : "text-title",
        )}
      >
        {daysNum(summary.remaining)}
      </TD>
    </>
  );
}
