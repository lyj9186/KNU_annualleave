import { describe, expect, it } from "vitest";
import {
  daysKo,
  daysNum,
  parseDateOnly,
  rangeKo,
  toUtcMidnight,
  todayIso,
  ymd,
  ymdKo,
  yearRange,
} from "./datetime";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

describe("ymd / ymdKo", () => {
  it("UTC 기준 포맷", () => {
    expect(ymd(d("2026-03-05"))).toBe("2026-03-05");
    expect(ymd(d("2026-11-09"))).toBe("2026-11-09");
  });
  it("요일 포함", () => {
    // 2026-03-05 는 목요일
    expect(ymdKo(d("2026-03-05"))).toBe("2026-03-05 (목)");
  });
  it("시분초가 있어도 UTC 날짜만", () => {
    expect(ymd(new Date("2026-03-05T23:59:00.000Z"))).toBe("2026-03-05");
  });
});

describe("rangeKo", () => {
  it("같은 날은 하루만", () => {
    expect(rangeKo(d("2026-03-05"), d("2026-03-05"))).toBe("2026-03-05 (목)");
  });
  it("다른 날은 범위", () => {
    expect(rangeKo(d("2026-03-05"), d("2026-03-06"))).toBe(
      "2026-03-05 (목) ~ 2026-03-06 (금)",
    );
  });
});

describe("daysKo / daysNum", () => {
  it("정수는 그대로, 소수는 한 자리", () => {
    expect(daysNum(1)).toBe("1");
    expect(daysNum(0.5)).toBe("0.5");
    expect(daysNum(2.5)).toBe("2.5");
    expect(daysKo(1)).toBe("1일");
    expect(daysKo(0.5)).toBe("0.5일");
  });
});

describe("parseDateOnly / toUtcMidnight", () => {
  it("YYYY-MM-DD → UTC 자정", () => {
    const parsed = parseDateOnly("2026-03-05");
    expect(parsed.toISOString()).toBe("2026-03-05T00:00:00.000Z");
  });
  it("toUtcMidnight 는 시분초 제거", () => {
    const x = toUtcMidnight(new Date("2026-03-05T18:30:00.000Z"));
    expect(x.toISOString()).toBe("2026-03-05T00:00:00.000Z");
  });
});

describe("todayIso", () => {
  it("주입된 로컬 날짜를 YYYY-MM-DD 로", () => {
    const local = new Date(2026, 2, 5, 9, 0, 0); // 로컬 2026-03-05
    expect(todayIso(local)).toBe("2026-03-05");
  });
});

describe("yearRange", () => {
  it("[1/1, 다음해 1/1)", () => {
    const { start, end } = yearRange(2026);
    expect(start.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
});
