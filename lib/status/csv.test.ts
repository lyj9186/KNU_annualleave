import { describe, expect, it } from "vitest";
import { toLeaveUsageCsv } from "./csv";
import type { LeaveUsageRow } from "./types";

function row(over: Partial<LeaveUsageRow>): LeaveUsageRow {
  return {
    userId: "u",
    name: "홍길동",
    role: "USER",
    date: new Date("2026-09-02T00:00:00.000Z"),
    type: "HALF_AM",
    days: 0.5,
    ...over,
  };
}

const BOM = String.fromCharCode(0xfeff);

describe("toLeaveUsageCsv", () => {
  it("BOM + 헤더로 시작한다", () => {
    expect(toLeaveUsageCsv([])).toBe(`${BOM}이름,일자,종류,사용일수\r\n`);
  });

  it("행: 이름,일자,종류,사용일수", () => {
    const csv = toLeaveUsageCsv([row({ name: "김팀장" })]);
    expect(csv).toContain("김팀장,2026-09-02,오전반차,0.5");
  });

  it("정수 사용일수는 소수점 없이", () => {
    const csv = toLeaveUsageCsv([row({ type: "ANNUAL", days: 1 })]);
    expect(csv).toContain(",연차,1\r\n");
  });

  it("콤마가 든 이름은 큰따옴표로 감싼다", () => {
    const csv = toLeaveUsageCsv([row({ name: "홍,길동" })]);
    expect(csv).toContain('"홍,길동",2026-09-02');
  });
});
