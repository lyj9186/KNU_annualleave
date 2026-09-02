/** 여러 기능에서 재사용하는 Zod 필드 조각. */
import { z } from "zod";

const LOGIN_ID_RE = /^[a-zA-Z0-9._-]{3,30}$/;

export const loginIdField = z
  .string()
  .trim()
  .regex(LOGIN_ID_RE, {
    error: "아이디는 3~30자의 영문/숫자/._- 만 사용할 수 있습니다.",
  });

export const nameField = z
  .string()
  .trim()
  .min(1, { error: "이름을 입력하세요." })
  .max(20, { error: "이름은 20자 이하로 입력하세요." });

export const passwordField = z
  .string()
  .min(4, { error: "비밀번호는 4자 이상이어야 합니다." })
  .max(72, { error: "비밀번호는 72자 이하로 입력하세요." });

/** 0 이상 365 이하 연차 일수 (문자열 입력 허용) */
export const leaveDaysField = z.coerce
  .number({ error: "숫자를 입력하세요." })
  .min(0, { error: "0 이상이어야 합니다." })
  .max(365);
