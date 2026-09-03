import { describe, expect, it } from "vitest";
import { buildBalancesByUser, type BalanceRequest } from "./balance";

const req = (
  userId: string,
  type: BalanceRequest["type"],
  days: number,
  status: BalanceRequest["status"],
): BalanceRequest => ({ userId, type, days, status });

describe("buildBalancesByUser", () => {
  it("사용자별로 승인 연차·반차만 차감, 병가는 카운트만", () => {
    const map = buildBalancesByUser(
      ["a", "b"],
      [{ userId: "a", grantedDays: 15, adjustDays: 0 }],
      [
        req("a", "ANNUAL", 3, "APPROVED"),
        req("a", "HALF_AM", 0.5, "APPROVED"),
        req("a", "SICK", 2, "APPROVED"),
        req("a", "ANNUAL", 1, "PENDING"),
      ],
    );

    const a = map.get("a")!;
    expect(a.summary.granted).toBe(15);
    expect(a.summary.used).toBe(3.5);
    expect(a.summary.remaining).toBe(11.5);
    expect(a.summary.sickUsed).toBe(2);
    expect(a.pendingDays).toBe(1);
  });

  it("balance 행이 없으면 기본 부여일수(15) 적용", () => {
    const map = buildBalancesByUser(["b"], [], []);
    expect(map.get("b")!.summary.granted).toBe(15);
    expect(map.get("b")!.summary.remaining).toBe(15);
  });

  it("PENDING 병가·공가는 pendingDays 에 포함하지 않음", () => {
    const map = buildBalancesByUser(
      ["c"],
      [],
      [
        req("c", "SICK", 3, "PENDING"),
        req("c", "PUBLIC", 2, "PENDING"),
        req("c", "HALF_PM", 0.5, "PENDING"),
      ],
    );
    expect(map.get("c")!.pendingDays).toBe(0.5);
  });

  it("승인된 공가는 publicUsed 로만 잡히고 잔여를 깎지 않음", () => {
    const map = buildBalancesByUser(
      ["f"],
      [{ userId: "f", grantedDays: 15, adjustDays: 0 }],
      [req("f", "PUBLIC", 3, "APPROVED"), req("f", "ANNUAL", 1, "APPROVED")],
    );
    const f = map.get("f")!;
    expect(f.summary.used).toBe(1);
    expect(f.summary.remaining).toBe(14);
    expect(f.summary.publicUsed).toBe(3);
  });

  it("adjustDays 가 사용연차에 가산된다", () => {
    const map = buildBalancesByUser(
      ["d"],
      [{ userId: "d", grantedDays: 15, adjustDays: 2 }],
      [req("d", "ANNUAL", 1, "APPROVED")],
    );
    expect(map.get("d")!.summary.used).toBe(3);
    expect(map.get("d")!.summary.remaining).toBe(12);
  });

  it("REJECTED/CANCELLED 는 무시", () => {
    const map = buildBalancesByUser(
      ["e"],
      [{ userId: "e", grantedDays: 15, adjustDays: 0 }],
      [
        req("e", "ANNUAL", 5, "REJECTED"),
        req("e", "ANNUAL", 2, "CANCELLED"),
      ],
    );
    expect(map.get("e")!.summary.used).toBe(0);
    expect(map.get("e")!.pendingDays).toBe(0);
  });
});
