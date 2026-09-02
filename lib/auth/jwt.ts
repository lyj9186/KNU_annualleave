/**
 * 세션 토큰 서명/검증 (jose 만 사용).
 * next/headers 에 의존하지 않으므로 proxy.ts 에서도 사용 가능.
 */
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/leave";

export const COOKIE_NAME = "annual_leave_session";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7일

export interface SessionPayload {
  sub: string; // user id
  role: Role;
  name: string;
  loginId: string;
}

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET 환경변수가 설정되지 않았습니다. `openssl rand -base64 32` 로 생성하세요.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function decryptSession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.sub === "string" &&
      typeof payload.role === "string" &&
      typeof payload.name === "string" &&
      typeof payload.loginId === "string"
    ) {
      return {
        sub: payload.sub,
        role: payload.role as Role,
        name: payload.name,
        loginId: payload.loginId,
      };
    }
    return null;
  } catch {
    return null;
  }
}
