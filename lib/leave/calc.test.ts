import { describe, expect, it } from "vitest";
import {
  businessDaysBetween,
  computeLeaveDays,
  summarizeBalance,
} from "./calc";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

describe("businessDaysBetween", () => {
  it("월~금 5일", () => {
    expect(businessDaysBetween(d("2026-03-02"), d("2026-03-06"))).toBe(5);
  });
  it("주말 제외", () => {
    // 금(3/6) ~ 월(3/9) → 금, 월 = 2일
    expect(businessDaysBetween(d("2026-03-06"), d("2026-03-09"))).toBe(2);
  });
  it("하루", () => {
    expect(businessDaysBetween(d("2026-03-03"), d("2026-03-03"))).toBe(1);
  });
  it("토요일 하루 → 0", () => {
    expect(businessDaysBetween(d("2026-03-07"), d("2026-03-07"))).toBe(0);
  });
  it("역전된 기간 → 0", () => {
    expect(businessDaysBetween(d("2026-03-10"), d("2026-03-01"))).toBe(0);
  });
});

describe("computeLeaveDays", () => {
  it("연차: 영업일수", () => {
    expect(computeLeaveDays("ANNUAL", d("2026-03-02"), d("2026-03-04"))).toBe(3);
  });
  it("오전 반차: 0.5", () => {
    expect(computeLeaveDays("HALF_AM", d("2026-03-02"), d("2026-03-02"))).toBe(0.5);
  });
  it("오후 반차: 0.5", () => {
    expect(computeLeaveDays("HALF_PM", d("2026-03-02"), d("2026-03-02"))).toBe(0.5);
  });
  it("병가: 영업일수 (차감은 별도)", () => {
    expect(computeLeaveDays("SICK", d("2026-03-02"), d("2026-03-03"))).toBe(2);
  });
});

describe("summarizeBalance", () => {
  it("연차/반차 차감, 병가 미차감", () => {
    const s = summarizeBalance({
      grantedDays: 15,
      adjustDays: 0,
      approvedRequests: [
        { type: "ANNUAL", days: 3 },
        { type: "HALF_AM", days: 0.5 },
        { type: "HALF_PM", days: 0.5 },
        { type: "SICK", days: 2 },
      ],
    });
    expect(s.used).toBe(4);
    expect(s.remaining).toBe(11);
    expect(s.sickUsed).toBe(2);
  });

  it("수동 조정 반영", () => {
    const s = summarizeBalance({
      grantedDays: 15,
      adjustDays: 1.5,
      approvedRequests: [{ type: "ANNUAL", days: 2 }],
    });
    expect(s.used).toBe(3.5);
    expect(s.remaining).toBe(11.5);
  });

  it("초과 사용 시 음수 잔여", () => {
    const s = summarizeBalance({
      grantedDays: 1,
      adjustDays: 0,
      approvedRequests: [{ type: "ANNUAL", days: 3 }],
    });
    expect(s.remaining).toBe(-2);
  });
});
