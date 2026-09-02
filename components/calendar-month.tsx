import Link from "next/link";
import { buildMonthGrid, coversDay } from "@/lib/calendar";
import { cn } from "@/lib/cn";
import { LEAVE_TYPE_SHORT } from "@/lib/leave";
import type { CalendarLeave } from "@/lib/queries";
import { WEEKDAYS, daysNum, todayIso } from "@/lib/datetime";

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
        <h2 className="text-base font-semibold text-slate-800">
          {year}년 {month0 + 1}월
        </h2>
        <div className="flex items-center gap-1">
          <NavLink href={`/main?y=${prev.y}&m=${prev.m}`} label="이전" />
          <NavLink href="/main" label="이번 달" />
          <NavLink href={`/main?y=${next.y}&m=${next.m}`} label="다음" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 border-l border-t border-slate-200 text-xs">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={cn(
                  "border-r border-b border-slate-200 bg-slate-50 py-1.5 text-center font-medium",
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
              const isSingleDay = (l: (typeof leaves)[number]) =>
                l.startDate.getTime() === l.endDate.getTime();
              return (
                <div
                  key={cell.iso}
                  className={cn(
                    "min-h-[92px] border-r border-b border-slate-200 p-1",
                    !cell.inMonth && "bg-slate-50/60",
                    cell.iso === todayStr && "bg-blue-50",
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 text-right text-xs",
                      !cell.inMonth ? "text-slate-300" : "text-slate-500",
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
                        {l.type === "HALF_AM" || l.type === "HALF_PM"
                          ? " 0.5"
                          : isSingleDay(l)
                            ? ` ${daysNum(l.days)}`
                            : ""}
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
      <p className="mt-2 text-xs text-slate-400">* 표시는 승인 대기 중인 신청입니다.</p>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}
