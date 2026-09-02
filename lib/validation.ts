import { z } from "zod";

export const LOGIN_ID_RE = /^[a-zA-Z0-9._-]{3,30}$/;

/** "YYYY-MM-DD" 문자열 → UTC 자정 Date */
export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

const loginId = z
  .string()
  .trim()
  .regex(LOGIN_ID_RE, {
    error: "아이디는 3~30자의 영문/숫자/._- 만 사용할 수 있습니다.",
  });

const name = z
  .string()
  .trim()
  .min(1, { error: "이름을 입력하세요." })
  .max(20, { error: "이름은 20자 이하로 입력하세요." });

const password = z
  .string()
  .min(8, { error: "비밀번호는 8자 이상이어야 합니다." })
  .max(72, { error: "비밀번호는 72자 이하로 입력하세요." });

export const signupSchema = z
  .object({
    loginId,
    name,
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  loginId: z.string().trim().min(1, { error: "아이디를 입력하세요." }),
  password: z.string().min(1, { error: "비밀번호를 입력하세요." }),
});

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
  loginId,
  name,
  password,
  role: roleEnum,
  grantedDays: z.coerce
    .number({ error: "숫자를 입력하세요." })
    .min(0, { error: "0 이상이어야 합니다." })
    .max(365),
});

export const updateUserSchema = z.object({
  userId: z.string().min(1),
  name,
  role: roleEnum,
  status: userStatusEnum,
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: password,
});

export const setBalanceSchema = z.object({
  userId: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2100),
  grantedDays: z.coerce
    .number({ error: "숫자를 입력하세요." })
    .min(0, { error: "0 이상이어야 합니다." })
    .max(365),
  adjustDays: z.coerce
    .number({ error: "숫자를 입력하세요." })
    .min(-365)
    .max(365),
});

export type FieldErrors = Record<string, string[] | undefined>;

export interface FormState {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
}
