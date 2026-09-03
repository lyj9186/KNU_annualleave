import { describe, expect, it } from "vitest";
import { expandLeaveUsage, type LeaveUsageInput } from "./expand";
import { ymd } from "@/lib/datetime";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);
const base = { userId: "u1", name: "홍길동", role: "USER" } as const;

function input(over: Partial<LeaveUsageInput>): LeaveUsageInput {
  return {
    ...base,
    type: "ANNUAL",
    startDate: d("2026-09-01"),
    endDate: d("2026-09-01"),
    ...over,
  };
}

describe("expandLeaveUsage", () => {
  it("연차 다일 → 영업일마다 1행(1일)", () => {
    // 2026-09-01(화) ~ 2026-09-04(금)
    const rows = expandLeaveUsage(
      [input({ startDate: d("2026-09-01"), endDate: d("2026-09-04") })],
      2026,
      8,
    );
    expect(rows.map((r) => ymd(r.date))).toEqual([
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
    ]);
    expect(rows.every((r) => r.days === 1)).toBe(true);
  });

  it("주말은 제외", () => {
    // 2026-09-04(금) ~ 2026-09-07(월)
    const rows = expandLeaveUsage(
      [input({ startDate: d("2026-09-04"), endDate: d("2026-09-07") })],
      2026,
      8,
    );
    expect(rows.map((r) => ymd(r.date))).toEqual(["2026-09-04", "2026-09-07"]);
  });

  it("월 경계 밖은 잘라낸다", () => {
    // 8/27 ~ 9/2 → 9월 조회 시 9/1, 9/2
    const rows = expandLeaveUsage(
      [input({ startDate: d("2026-08-27"), endDate: d("2026-09-02") })],
      2026,
      8,
    );
    expect(rows.map((r) => ymd(r.date))).toEqual(["2026-09-01", "2026-09-02"]);
  });

  it("isHoliday 를 주면 공휴일은 행에서 빠진다", () => {
    // 추석 2026-09-25(금) 공휴일 처리, 연차 9/24(목)~9/28(월)
    const isHol = (x: Date) => ymd(x) === "2026-09-25";
    const rows = expandLeaveUsage(
      [input({ startDate: d("2026-09-24"), endDate: d("2026-09-28") })],
      2026,
      8,
      isHol,
    );
    expect(rows.map((r) => ymd(r.date))).toEqual(["2026-09-24", "2026-09-28"]);
  });

  it("공가도 영업일마다 1행", () => {
    // 2026-09-01(화) ~ 2026-09-02(수)
    const rows = expandLeaveUsage(
      [input({ type: "PUBLIC", startDate: d("2026-09-01"), endDate: d("2026-09-02") })],
      2026,
      8,
    );
    expect(rows.map((r) => [ymd(r.date), r.type, r.days])).toEqual([
      ["2026-09-01", "PUBLIC", 1],
      ["2026-09-02", "PUBLIC", 1],
    ]);
  });

  it("반차 → 1행 0.5일", () => {
    const rows = expandLeaveUsage(
      [input({ type: "HALF_AM", startDate: d("2026-09-02"), endDate: d("2026-09-02") })],
      2026,
      8,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].days).toBe(0.5);
    expect(ymd(rows[0].date)).toBe("2026-09-02");
  });

  it("다른 달 신청은 결과 없음", () => {
    const rows = expandLeaveUsage(
      [input({ startDate: d("2026-10-01"), endDate: d("2026-10-02") })],
      2026,
      8,
    );
    expect(rows).toEqual([]);
  });

  it("일자 → 역할 → 이름 순 정렬", () => {
    const rows = expandLeaveUsage(
      [
        input({ userId: "b", name: "이사원", role: "USER", type: "HALF_AM", startDate: d("2026-09-02"), endDate: d("2026-09-02") }),
        input({ userId: "c", name: "김팀장", role: "TEAM_LEAD", type: "HALF_PM", startDate: d("2026-09-02"), endDate: d("2026-09-02") }),
        input({ userId: "a", name: "박대리", role: "USER", type: "HALF_AM", startDate: d("2026-09-01"), endDate: d("2026-09-01") }),
      ],
      2026,
      8,
    );
    expect(rows.map((r) => [ymd(r.date), r.name])).toEqual([
      ["2026-09-01", "박대리"],
      ["2026-09-02", "김팀장"],
      ["2026-09-02", "이사원"],
    ]);
  });
});
