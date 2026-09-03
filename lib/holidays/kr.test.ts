import { describe, expect, it } from "vitest";
import { HOLIDAY_YEARS, isKrHoliday, krHolidayName } from "./kr";
import { parseDateOnly } from "@/lib/datetime";

describe("krHolidayName", () => {
  it("고정 공휴일", () => {
    expect(krHolidayName("2026-01-01")).toBe("신정");
    expect(krHolidayName("2026-05-05")).toBe("어린이날");
    expect(krHolidayName("2026-06-06")).toBe("현충일");
    expect(krHolidayName("2026-12-25")).toBe("성탄절");
  });

  it("설날·추석 연휴 3일", () => {
    for (const d of ["2026-02-16", "2026-02-17", "2026-02-18"]) {
      expect(krHolidayName(d)).toBe("설날");
    }
    for (const d of ["2026-09-24", "2026-09-25", "2026-09-26"]) {
      expect(krHolidayName(d)).toBe("추석");
    }
  });

  it("대체공휴일", () => {
    expect(krHolidayName("2026-03-02")).toBe("대체공휴일"); // 삼일절(일) 대체
    expect(krHolidayName("2026-08-17")).toBe("대체공휴일"); // 광복절(토) 대체
    expect(krHolidayName("2026-09-28")).toBe("대체공휴일"); // 추석 연휴 토요일 대체
  });

  it("평일은 null", () => {
    expect(krHolidayName("2026-09-03")).toBeNull();
    expect(krHolidayName("2026-11-11")).toBeNull();
  });

  it("데이터 범위 밖은 null", () => {
    expect(krHolidayName(`${HOLIDAY_YEARS.min - 1}-01-01`)).toBeNull();
    expect(krHolidayName(`${HOLIDAY_YEARS.max + 1}-01-01`)).toBeNull();
  });
});

describe("isKrHoliday", () => {
  it("Date(UTC 자정) 기준 판정", () => {
    expect(isKrHoliday(parseDateOnly("2026-09-25"))).toBe(true);
    expect(isKrHoliday(parseDateOnly("2026-09-03"))).toBe(false);
  });
});
