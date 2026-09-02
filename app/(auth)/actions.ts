"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSessionCookie, destroySessionCookie } from "@/lib/session";
import { loginSchema, signupSchema } from "@/lib/validation";
import type { FormState } from "@/lib/form";
import { DEFAULT_ANNUAL_DAYS } from "@/lib/leave";

export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    loginId: String(formData.get("loginId") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const next = String(formData.get("next") ?? "") || "/main";

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      values: { loginId: raw.loginId },
    };
  }

  const user = await db.user.findUnique({
    where: { loginId: parsed.data.loginId },
  });

  const genericError: FormState = {
    message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    values: { loginId: raw.loginId },
  };

  if (!user) return genericError;

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return genericError;

  if (user.status === "PENDING") {
    return {
      message: "마스터 승인 대기 중인 계정입니다. 승인 후 로그인할 수 있습니다.",
      values: { loginId: raw.loginId },
    };
  }
  if (user.status === "DISABLED") {
    return {
      message: "비활성화된 계정입니다. 관리자에게 문의하세요.",
      values: { loginId: raw.loginId },
    };
  }

  await createSessionCookie({
    sub: user.id,
    role: user.role,
    name: user.name,
    loginId: user.loginId,
  });

  redirect(next.startsWith("/") ? next : "/main");
}

export async function signup(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    loginId: String(formData.get("loginId") ?? ""),
    name: String(formData.get("name") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      values: { loginId: raw.loginId, name: raw.name },
    };
  }

  const exists = await db.user.findUnique({
    where: { loginId: parsed.data.loginId },
    select: { id: true },
  });
  if (exists) {
    return {
      errors: { loginId: ["이미 사용 중인 아이디입니다."] },
      values: { loginId: raw.loginId, name: raw.name },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const year = new Date().getUTCFullYear();

  await db.user.create({
    data: {
      loginId: parsed.data.loginId,
      name: parsed.data.name,
      passwordHash,
      role: "USER",
      status: "PENDING",
      balances: {
        create: { year, grantedDays: DEFAULT_ANNUAL_DAYS, adjustDays: 0 },
      },
    },
  });

  return {
    ok: true,
    message:
      "가입 신청이 완료되었습니다. 마스터가 계정을 승인하면 로그인할 수 있습니다.",
  };
}

export async function logout(): Promise<void> {
  await destroySessionCookie();
  redirect("/login");
}
