import "server-only";

import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  MAX_AGE_SECONDS,
  decryptSession,
  encryptSession,
  type SessionPayload,
} from "@/lib/session-token";

export type { SessionPayload };
export { COOKIE_NAME };

export async function createSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await encryptSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(COOKIE_NAME)?.value);
}
