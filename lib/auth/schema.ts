import { z } from "zod";
import { loginIdField, nameField, passwordField } from "@/lib/schema";

export const loginSchema = z.object({
  loginId: z.string().trim().min(1, { error: "아이디를 입력하세요." }),
  password: z.string().min(1, { error: "비밀번호를 입력하세요." }),
});

export const signupSchema = z
  .object({
    loginId: loginIdField,
    name: nameField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });
