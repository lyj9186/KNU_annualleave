import { describe, expect, it } from "vitest";
import { decryptSession, encryptSession, type SessionPayload } from "./jwt";

const payload: SessionPayload = {
  sub: "user_1",
  role: "TEAM_LEAD",
  name: "김팀장",
  loginId: "lead1",
};

describe("세션 토큰", () => {
  it("서명 → 검증 라운드트립", async () => {
    const token = await encryptSession(payload);
    expect(token.split(".")).toHaveLength(3);
    await expect(decryptSession(token)).resolves.toEqual(payload);
  });

  it("빈/누락 토큰은 null", async () => {
    await expect(decryptSession(undefined)).resolves.toBeNull();
    await expect(decryptSession("")).resolves.toBeNull();
  });

  it("변조된 토큰은 null", async () => {
    const token = await encryptSession(payload);
    const tampered = token.slice(0, -3) + "aaa";
    await expect(decryptSession(tampered)).resolves.toBeNull();
  });

  it("형식이 잘못된 문자열은 null", async () => {
    await expect(decryptSession("not-a-jwt")).resolves.toBeNull();
  });

  it("payload 필드가 부족하면 null", async () => {
    // name 없이 직접 서명한 토큰 흉내 — decrypt 가 필드 검사에서 걸러야 함
    const { SignJWT } = await import("jose");
    const key = new TextEncoder().encode(process.env.SESSION_SECRET);
    const bad = await new SignJWT({ sub: "x", role: "USER" })
      .setProtectedHeader({ alg: "HS256" })
      .sign(key);
    await expect(decryptSession(bad)).resolves.toBeNull();
  });
});
