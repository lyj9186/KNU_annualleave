import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSessionCookie } from "@/lib/auth/session";
import type { Role } from "@/lib/leave";

export interface CurrentUser {
  id: string;
  loginId: string;
  name: string;
  role: Role;
}

/**
 * 현재 로그인한 사용자를 반환. 세션이 없거나, 계정이 삭제/비활성 상태면 null.
 * React cache 로 렌더 1회당 1번만 조회.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSessionCookie();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, loginId: true, name: true, role: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") return null;

  return {
    id: user.id,
    loginId: user.loginId,
    name: user.name,
    role: user.role,
  };
});

/** 로그인 필수. 아니면 /login 으로 리다이렉트. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** 승인 권한(팀장·마스터) 필수. 아니면 /main 으로. */
export async function requireApprover(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "TEAM_LEAD" && user.role !== "MASTER") redirect("/main");
  return user;
}

/** 마스터 필수. 아니면 /main 으로. */
export async function requireMaster(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "MASTER") redirect("/main");
  return user;
}

export function canApprove(role: Role): boolean {
  return role === "TEAM_LEAD" || role === "MASTER";
}
