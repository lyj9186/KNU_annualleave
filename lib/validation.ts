import { z } from "zod";
import { parseDateOnly } from "@/lib/datetime";
import {
  leaveDaysField,
  loginIdField,
  nameField,
  passwordField,
} from "@/lib/schema";

export const leaveTypeEnum = z.enum(["ANNUAL", "HALF_AM", "HALF_PM", "SICK"]);

/** 반차이거나 종료일 미지정이면 종료일 = 시작일 */
export function resolveEndDate(v: {
  type: string;
  startDate: string;
  endDate?: string | null;
}): string {
  if (v.type === "HALF_AM" || v.type === "HALF_PM") return v.startDate;
  return v.endDate ? v.endDate : v.startDate;
}

export const leaveRequestSchema = z
  .object({
    type: leaveTypeEnum,
    startDate: z.iso.date({ error: "시작일을 선택하세요." }),
    endDate: z.iso
      .date({ error: "종료일을 선택하세요." })
      .optional()
      .or(z.literal("")),
    reason: z
      .string()
      .trim()
      .max(200, { error: "사유는 200자 이하로 입력하세요." })
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (v) => parseDateOnly(resolveEndDate(v)) >= parseDateOnly(v.startDate),
    {
      error: "종료일은 시작일과 같거나 이후여야 합니다.",
      path: ["endDate"],
    },
  );

export const decisionSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["approve", "reject", "cancel"]),
  note: z
    .string()
    .trim()
    .max(200, { error: "메모는 200자 이하로 입력하세요." })
    .optional()
    .or(z.literal("")),
});

export const roleEnum = z.enum(["MASTER", "TEAM_LEAD", "USER"]);
export const userStatusEnum = z.enum(["PENDING", "ACTIVE", "DISABLED"]);

export const createUserSchema = z.object({
  loginId: loginIdField,
  name: nameField,
  password: passwordField,
  role: roleEnum,
  grantedDays: leaveDaysField,
});

export const updateUserSchema = z.object({
  userId: z.string().min(1),
  name: nameField,
  role: roleEnum,
  status: userStatusEnum,
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: passwordField,
});

export const setBalanceSchema = z.object({
  userId: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2100),
  grantedDays: leaveDaysField,
  adjustDays: z.coerce
    .number({ error: "숫자를 입력하세요." })
    .min(-365)
    .max(365),
});
