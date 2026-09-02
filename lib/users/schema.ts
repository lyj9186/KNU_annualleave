import { z } from "zod";
import {
  leaveDaysField,
  loginIdField,
  nameField,
  passwordField,
} from "@/lib/schema";

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
