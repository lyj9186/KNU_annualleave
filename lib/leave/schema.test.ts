import { describe, expect, it } from "vitest";
import { leaveRequestSchema, resolveEndDate } from "./schema";

describe("resolveEndDate", () => {
  it("반차는 항상 시작일", () => {
    expect(
      resolveEndDate({ type: "HALF_AM", startDate: "2026-03-05", endDate: "2026-03-09" }),
    ).toBe("2026-03-05");
    expect(
      resolveEndDate({ type: "HALF_PM", startDate: "2026-03-05" }),
    ).toBe("2026-03-05");
  });
  it("연차는 종료일 유지, 없으면 시작일", () => {
    expect(
      resolveEndDate({ type: "ANNUAL", startDate: "2026-03-05", endDate: "2026-03-07" }),
    ).toBe("2026-03-07");
    expect(
      resolveEndDate({ type: "ANNUAL", startDate: "2026-03-05", endDate: "" }),
    ).toBe("2026-03-05");
    expect(
      resolveEndDate({ type: "SICK", startDate: "2026-03-05" }),
    ).toBe("2026-03-05");
  });
});

describe("leaveRequestSchema", () => {
  const base = { type: "ANNUAL", startDate: "2026-03-05", endDate: "2026-03-07" };

  it("정상 입력 통과", () => {
    expect(leaveRequestSchema.safeParse(base).success).toBe(true);
  });

  it("종료일 생략 허용", () => {
    const r = leaveRequestSchema.safeParse({
      type: "ANNUAL",
      startDate: "2026-03-05",
      endDate: "",
    });
    expect(r.success).toBe(true);
  });

  it("종료일이 시작일보다 빠르면 실패", () => {
    const r = leaveRequestSchema.safeParse({
      ...base,
      endDate: "2026-03-01",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const msg = r.error.issues.find((i) => i.path.includes("endDate"))?.message;
      expect(msg).toBe("종료일은 시작일과 같거나 이후여야 합니다.");
    }
  });

  it("반차는 종료일이 빨라도 통과 (resolveEndDate 로 보정)", () => {
    const r = leaveRequestSchema.safeParse({
      type: "HALF_AM",
      startDate: "2026-03-05",
      endDate: "2026-03-01",
    });
    expect(r.success).toBe(true);
  });

  it("공가(PUBLIC) 허용", () => {
    expect(
      leaveRequestSchema.safeParse({ ...base, type: "PUBLIC" }).success,
    ).toBe(true);
  });

  it("잘못된 종류 거부", () => {
    expect(
      leaveRequestSchema.safeParse({ ...base, type: "VACATION" }).success,
    ).toBe(false);
  });

  it("사유 200자 초과 거부", () => {
    const r = leaveRequestSchema.safeParse({ ...base, reason: "가".repeat(201) });
    expect(r.success).toBe(false);
  });

  it("날짜 형식 오류 거부", () => {
    expect(
      leaveRequestSchema.safeParse({ ...base, startDate: "2026/03/05" }).success,
    ).toBe(false);
  });
});
