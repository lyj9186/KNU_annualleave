/**
 * 서버 액션 폼 상태 + FormData 헬퍼.
 * 모든 mutation 액션은 `useActionState` 와 이 `FormState` 를 사용한다.
 */
import { z, type ZodError } from "zod";

export type FieldErrors = Record<string, string[] | undefined>;

export interface FormState {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
}

/** FormData 에서 문자열 필드를 한 번에 뽑는다 (없으면 ""). */
export function readForm<K extends string>(
  formData: FormData,
  ...keys: K[]
): Record<K, string> {
  return Object.fromEntries(
    keys.map((k) => [k, String(formData.get(k) ?? "")]),
  ) as Record<K, string>;
}

/** ZodError → 필드별 에러 메시지 맵 */
export function fieldErrors(error: ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors;
}
