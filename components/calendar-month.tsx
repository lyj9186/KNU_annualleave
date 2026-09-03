"use client";

import { useMemo, useState } from "react";
import { buildMonthGrid, coversDay } from "@/lib/calendar/grid";
import { cn } from "@/lib/cn";
import { LEAVE_TYPE_SHORT } from "@/lib/leave";
import type { CalendarLeave } from "@/lib/dashboard/queries";
import { WEEKDAYS, daysNum, parseDateOnly, todayIso } from "@/lib/datetime";
import { krHolidayName } from "@/lib/holidays/kr";
import { MonthPicker } from "@/components/month-picker";

function isSingleDay(l: CalendarLeave): boolean {
  return l.startDate.getTime() === l.endDate.getTime();
}

/** 달력 칩 일수 표기 (반차 0.5 / 하루짜리만 숫자, 다일은 생략) */
function chipDays(l: CalendarLeave): string {
  if (l.type === "HALF_AM" || l.type === "HALF_PM") return " 0.5";
  return isSingleDay(l) ? ` ${daysNum(l.days)}` : "";
}

function leaveChipClass(l: CalendarLeave): string {
  if (l.status === "PENDING")
    return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  if (l.type === "SICK") return "bg-fuchsia-50 text-fuchsia-700";
  if (l.type === "PUBLIC") return "bg-teal-50 text-teal-700";
  return "bg-blue-50 text-blue-700";
}

/** 미니 달력 점 색상 */
function dotClass(l: CalendarLeave): string {
  if (l.status === "PENDING") return "bg-amber-400";
  if (l.type === "SICK") return "bg-fuchsia-400";
  if (l.type === "PUBLIC") return "bg-teal-500";
  return "bg-blue-500";
}

/** 모바일 목록 한 줄 */
function LeaveLine({ l }: { l: CalendarLeave }) {
  return (
    <li className="text-sm leading-snug">
      <span className="font-medium text-body">{l.userName}</span>{" "}
      <span className="text-subtle">
        {LEAVE_TYPE_SHORT[l.type]} {daysNum(l.days)}일
      </span>
      {l.status === "PENDING" ? (
        <span className="ml-1 text-xs text-amber-600">대기</span>
      ) : null}
    </li>
  );
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
  const cells = weeks.flat();
  const todayStr = todayIso();

  const leavesOn = (day: Date) =>
    leaves.filter((l) => coversDay(day, l.startDate, l.endDate));

  // 기본 선택: 오늘이 이 달에 있으면 오늘, 아니면 연차가 있는 첫날
  const todayInMonth = cells.some((c) => c.inMonth && c.iso === todayStr);
  const firstWithLeaves = cells.find(
    (c) => c.inMonth && leavesOn(c.date).length > 0,
  )?.iso;
  const [selected, setSelected] = useState<string | null>(
    todayInMonth ? todayStr : (firstWithLeaves ?? null),
  );

  const selectedInfo = useMemo(() => {
    if (!selected) return null;
    const date = parseDateOnly(selected);
    return {
      label: `${date.getUTCMonth() + 1}월 ${date.getUTCDate()}일 (${WEEKDAYS[date.getUTCDay()]})`,
      holiday: krHolidayName(selected),
      items: leaves.filter((l) => coversDay(date, l.startDate, l.endDate)),
    };
  }, [selected, leaves]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-title">
          {year}년 {month0 + 1}월
        </h2>
        <MonthPicker basePath="/main" year={year} month0={month0} />
      </div>

      {/* 모바일: 미니 달력(점) + 선택한 날짜의 목록 */}
      <div className="lg:hidden">
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-line bg-line">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={cn(
                "bg-surface-muted py-1 text-center text-[11px] font-medium",
                i === 0 && "text-rose-500",
                i === 6 && "text-blue-500",
              )}
            >
              {w}
            </div>
          ))}

          {cells.map((cell) => {
            const dayLeaves = leavesOn(cell.date);
            const holiday = krHolidayName(cell.iso);
            const isSelected = cell.iso === selected;
            const isToday = cell.iso === todayStr;
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setSelected(cell.iso)}
                aria-pressed={isSelected}
                aria-label={`${cell.date.getUTCMonth() + 1}월 ${cell.date.getUTCDate()}일${holiday ? `, ${holiday}` : ""}${dayLeaves.length ? `, 연차 ${dayLeaves.length}건` : ""}`}
                className={cn(
                  "flex min-h-[3rem] select-none flex-col items-center gap-0.5 bg-surface py-1.5 transition-colors",
                  !cell.inMonth && "bg-surface-muted/60",
                  isSelected && "bg-blue-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[12px] leading-none",
                    isSelected
                      ? "bg-brand font-semibold text-white"
                      : !cell.inMonth
                        ? "text-faint"
                        : isToday
                          ? "font-bold text-brand"
                          : holiday || cell.dow === 0
                            ? "text-rose-500"
                            : cell.dow === 6
                              ? "text-blue-500"
                              : "text-body",
                  )}
                >
                  {cell.date.getUTCDate()}
                </span>
                <span className="flex h-1.5 flex-wrap justify-center gap-0.5">
                  {dayLeaves.slice(0, 4).map((l) => (
                    <span
                      key={l.id}
                      className={cn("h-1.5 w-1.5 rounded-full", dotClass(l))}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />연차
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />병가
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />공가
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />대기
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-sm bg-rose-400" />공휴일
          </span>
        </div>

        <div className="mt-3 rounded-md border border-line">
          {selectedInfo ? (
            <>
              <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-sm font-semibold text-title">
                <span>{selectedInfo.label}</span>
                {selectedInfo.holiday ? (
                  <span className="rounded bg-rose-50 px-1.5 py-0.5 text-xs font-medium text-rose-700">
                    {selectedInfo.holiday}
                  </span>
                ) : null}
              </div>
              {selectedInfo.items.length === 0 ? (
                <p className="px-3 py-5 text-center text-sm text-faint">
                  등록된 연차가 없습니다.
                </p>
              ) : (
                <ul className="space-y-1.5 px-3 py-2.5">
                  {selectedInfo.items.map((l) => (
                    <LeaveLine key={l.id} l={l} />
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="px-3 py-5 text-center text-sm text-faint">
              이번 달 등록된 연차가 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* 데스크톱: 월 그리드 */}
      <div className="hidden overflow-x-auto lg:block">
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

          {cells.map((cell) => {
            const dayLeaves = leavesOn(cell.date);
            const holiday = krHolidayName(cell.iso);
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
                    cell.inMonth &&
                      (holiday || cell.dow === 0) &&
                      "text-rose-500",
                    cell.dow === 6 && cell.inMonth && !holiday && "text-blue-500",
                  )}
                >
                  {cell.date.getUTCDate()}
                </div>
                {holiday && cell.inMonth ? (
                  <div
                    className="mb-1 truncate rounded bg-rose-50 px-1 py-0.5 text-[11px] font-medium leading-tight text-rose-700"
                    title={holiday}
                  >
                    {holiday}
                  </div>
                ) : null}
                <ul className="space-y-0.5">
                  {dayLeaves.map((l) => (
                    <li
                      key={l.id}
                      className={cn(
                        "truncate rounded px-1 py-0.5 text-[11px] leading-tight",
                        leaveChipClass(l),
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

      <p className="mt-2 hidden text-xs text-faint lg:block">
        * 표시는 승인 대기 중인 신청 · <span className="text-rose-500">빨간 날짜</span>는
        공휴일입니다.
      </p>
    </div>
  );
}
