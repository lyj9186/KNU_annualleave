import { buildMonthGrid, coversDay } from "@/lib/calendar/grid";
import { cn } from "@/lib/cn";
import { LEAVE_TYPE_SHORT } from "@/lib/leave";
import type { CalendarLeave } from "@/lib/dashboard/queries";
import { WEEKDAYS, daysNum, todayIso } from "@/lib/datetime";
import { ChipLink } from "@/components/ui";

function isSingleDay(l: CalendarLeave): boolean {
  return l.startDate.getTime() === l.endDate.getTime();
}

/** 달력 칩 일수 표기 (반차 0.5 / 하루짜리만 숫자, 다일은 생략) */
function chipDays(l: CalendarLeave): string {
  if (l.type === "HALF_AM" || l.type === "HALF_PM") return " 0.5";
  return isSingleDay(l) ? ` ${daysNum(l.days)}` : "";
}

export function CalendarMonth({
  year,
  month0,
  leaves,
}: {
  year: number;
  month0: number;
  leaves: CalendarLeave[];
}) {
  const weeks = buildMonthGrid(year, month0);
  const prev = month0 === 0 ? { y: year - 1, m: 12 } : { y: year, m: month0 };
  const next = month0 === 11 ? { y: year + 1, m: 1 } : { y: year, m: month0 + 2 };
  const todayStr = todayIso();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-title">
          {year}년 {month0 + 1}월
        </h2>
        <div className="flex items-center gap-1">
          <ChipLink variant="plain" href={`/main?y=${prev.y}&m=${prev.m}`}>
            이전
          </ChipLink>
          <ChipLink variant="plain" href="/main">
            이번 달
          </ChipLink>
          <ChipLink variant="plain" href={`/main?y=${next.y}&m=${next.m}`}>
            다음
          </ChipLink>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 border-l border-t border-line text-xs">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={cn(
                  "border-r border-b border-line bg-surface-muted py-1.5 text-center font-medium",
                  i === 0 && "text-rose-500",
                  i === 6 && "text-blue-500",
                )}
              >
                {w}
              </div>
            ))}

            {weeks.flat().map((cell) => {
              const dayLeaves = leaves.filter((l) =>
                coversDay(cell.date, l.startDate, l.endDate),
              );
              return (
                <div
                  key={cell.iso}
                  className={cn(
                    "min-h-[92px] border-r border-b border-line p-1",
                    !cell.inMonth && "bg-slate-50/60",
                    cell.iso === todayStr && "bg-blue-50",
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 text-right text-xs",
                      !cell.inMonth ? "text-slate-300" : "text-muted",
                      cell.dow === 0 && cell.inMonth && "text-rose-500",
                      cell.dow === 6 && cell.inMonth && "text-blue-500",
                    )}
                  >
                    {cell.date.getUTCDate()}
                  </div>
                  <ul className="space-y-0.5">
                    {dayLeaves.map((l) => (
                      <li
                        key={l.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[11px] leading-tight",
                          l.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
                            : l.type === "SICK"
                              ? "bg-fuchsia-50 text-fuchsia-700"
                              : "bg-blue-50 text-blue-700",
                        )}
                        title={`${l.userName} · ${LEAVE_TYPE_SHORT[l.type]} ${daysNum(l.days)}일${l.status === "PENDING" ? " (대기)" : ""}`}
                      >
                        {l.userName} {LEAVE_TYPE_SHORT[l.type]}
                        {chipDays(l)}
                        {l.status === "PENDING" ? "*" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-faint">
        * 표시는 승인 대기 중인 신청입니다.
      </p>
    </div>
  );
}
