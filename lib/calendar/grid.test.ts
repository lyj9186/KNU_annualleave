import { describe, expect, it } from "vitest";
import { buildMonthGrid, clampMonth, coversDay } from "./grid";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

describe("buildMonthGrid", () => {
  it("일요일 시작 7열, 첫 칸은 그 주 일요일", () => {
    // 2026-03-01 는 일요일 → 앞칸 없음
    const weeks = buildMonthGrid(2026, 2);
    expect(weeks[0]).toHaveLength(7);
    expect(weeks[0][0].iso).toBe("2026-03-01");
    expect(weeks[0][0].dow).toBe(0);
  });

  it("앞 달 날짜로 첫 주를 채운다", () => {
    // 2026-09-01 는 화요일 → 첫 주에 8/30(일), 8/31(월) 포함
    const weeks = buildMonthGrid(2026, 8);
    expect(weeks[0][0].iso).toBe("2026-08-30");
    expect(weeks[0][0].inMonth).toBe(false);
    expect(weeks[0][2].iso).toBe("2026-09-01");
    expect(weeks[0][2].inMonth).toBe(true);
  });

  it("이번 달 마지막 날을 포함한 주까지만", () => {
    const weeks = buildMonthGrid(2026, 8); // 9월 (30일, 화 시작)
    const flat = weeks.flat();
    expect(flat.some((c) => c.iso === "2026-09-30")).toBe(true);
    // 5주로 끝나야 함 (9/1 화 ~ 9/30 수)
    expect(weeks).toHaveLength(5);
  });

  it("최대 6주", () => {
    // 2026-08-01 는 토요일 → 6주 걸리는 달
    const weeks = buildMonthGrid(2026, 7);
    expect(weeks.length).toBeLessThanOrEqual(6);
    expect(weeks[0][6].iso).toBe("2026-08-01");
  });
});

describe("coversDay", () => {
  it("양 끝 포함", () => {
    expect(coversDay(d("2026-03-05"), d("2026-03-05"), d("2026-03-07"))).toBe(
      true,
    );
    expect(coversDay(d("2026-03-07"), d("2026-03-05"), d("2026-03-07"))).toBe(
      true,
    );
    expect(coversDay(d("2026-03-08"), d("2026-03-05"), d("2026-03-07"))).toBe(
      false,
    );
  });
  it("시분초 무시", () => {
    expect(
      coversDay(
        new Date("2026-03-05T23:00:00Z"),
        d("2026-03-05"),
        d("2026-03-05"),
      ),
    ).toBe(true);
  });
});

describe("clampMonth", () => {
  it("정상 범위는 그대로 (month1 1-12 → m0 0-11)", () => {
    expect(clampMonth(2026, 9)).toEqual({ y: 2026, m0: 8 });
    expect(clampMonth(2026, 1)).toEqual({ y: 2026, m0: 0 });
    expect(clampMonth(2026, 12)).toEqual({ y: 2026, m0: 11 });
  });
  it("0 이하는 전년으로 넘어간다", () => {
    expect(clampMonth(2026, 0)).toEqual({ y: 2025, m0: 11 });
    expect(clampMonth(2026, -1)).toEqual({ y: 2025, m0: 10 });
  });
  it("13 이상은 다음 해로", () => {
    expect(clampMonth(2026, 13)).toEqual({ y: 2027, m0: 0 });
    expect(clampMonth(2026, 25)).toEqual({ y: 2028, m0: 0 });
  });
});
