"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireMaster } from "@/lib/dal";
import {
  createUserSchema,
  resetPasswordSchema,
  setBalanceSchema,
  updateUserSchema,
} from "@/lib/validation";
import type { FormState } from "@/lib/form";

async function activeMasterCount(): Promise<number> {
  return db.user.count({ where: { role: "MASTER", status: "ACTIVE" } });
}

export async function createUser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireMaster();

  const raw = {
    loginId: String(formData.get("loginId") ?? ""),
    name: String(formData.get("name") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "USER"),
    grantedDays: String(formData.get("grantedDays") ?? "0"),
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      values: raw,
    };
  }

  const exists = await db.user.findUnique({
    where: { loginId: parsed.data.loginId },
    select: { id: true },
  });
  if (exists) {
    return {
      errors: { loginId: ["이미 사용 중인 아이디입니다."] },
      values: raw,
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const year = new Date().getUTCFullYear();

  await db.user.create({
    data: {
      loginId: parsed.data.loginId,
      name: parsed.data.name,
      passwordHash,
      role: parsed.data.role,
      status: "ACTIVE",
      balances: {
        create: { year, grantedDays: parsed.data.grantedDays, adjustDays: 0 },
      },
    },
  });

  revalidatePath("/settings");
  revalidatePath("/main");
  return { ok: true, message: `${parsed.data.name} 계정을 생성했습니다.` };
}

export async function updateUser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireMaster();

  const parsed = updateUserSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? ""),
    status: String(formData.get("status") ?? ""),
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const target = await db.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) return { message: "사용자를 찾을 수 없습니다." };

  const losingMaster =
    target.role === "MASTER" &&
    target.status === "ACTIVE" &&
    (parsed.data.role !== "MASTER" || parsed.data.status !== "ACTIVE");
  if (losingMaster && (await activeMasterCount()) <= 1) {
    return { message: "활성 마스터가 최소 1명은 있어야 합니다." };
  }

  await db.user.update({
    where: { id: parsed.data.userId },
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      status: parsed.data.status,
    },
  });

  revalidatePath("/settings");
  revalidatePath(`/settings/${parsed.data.userId}`);
  revalidatePath("/main");
  return { ok: true, message: "계정 정보를 저장했습니다." };
}

export async function resetPassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireMaster();

  const parsed = resetPasswordSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash },
  });

  return { ok: true, message: "비밀번호를 초기화했습니다." };
}

export async function setBalance(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireMaster();

  const parsed = setBalanceSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    year: String(formData.get("year") ?? ""),
    grantedDays: String(formData.get("grantedDays") ?? ""),
    adjustDays: String(formData.get("adjustDays") ?? "0"),
  });
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const { userId, year, grantedDays, adjustDays } = parsed.data;
  await db.leaveBalance.upsert({
    where: { userId_year: { userId, year } },
    create: { userId, year, grantedDays, adjustDays },
    update: { grantedDays, adjustDays },
  });

  revalidatePath("/settings");
  revalidatePath(`/settings/${userId}`);
  revalidatePath("/main");
  return { ok: true, message: `${year}년 연차를 저장했습니다.` };
}

export async function approvePendingUser(formData: FormData): Promise<void> {
  await requireMaster();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  await db.user.updateMany({
    where: { id: userId, status: "PENDING" },
    data: { status: "ACTIVE" },
  });
  revalidatePath("/settings");
  revalidatePath("/main");
  redirect(`/settings/${userId}`);
}
