"use client";

import { useActionState } from "react";
import { resetPassword, setBalance, updateUser } from "@/lib/users/actions";
import {
  Field,
  Input,
  Select,
  FormMessage,
  SubmitButton,
} from "@/components/ui";
import { ROLE_LABELS } from "@/lib/leave";
import type { FormState } from "@/lib/form";

const initial: FormState = {};

const ROLES = ["USER", "TEAM_LEAD", "MASTER"] as const;
const STATUSES = [
  { value: "ACTIVE", label: "활성" },
  { value: "PENDING", label: "승인대기" },
  { value: "DISABLED", label: "비활성" },
] as const;

export function UserEditForm({
  userId,
  name,
  role,
  status,
}: {
  userId: string;
  name: string;
  role: string;
  status: string;
}) {
  const [state, action] = useActionState(updateUser, initial);
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <FormMessage ok={state.ok}>{state.message}</FormMessage>
      ) : null}
      <input type="hidden" name="userId" value={userId} />
      <Field label="이름" htmlFor="e-name" error={state.errors?.name}>
        <Input id="e-name" name="name" defaultValue={name} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="역할" htmlFor="e-role" error={state.errors?.role}>
          <Select id="e-role" name="role" defaultValue={role}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="상태" htmlFor="e-status" error={state.errors?.status}>
          <Select id="e-status" name="status" defaultValue={status}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <SubmitButton pendingText="저장 중…">저장</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, action] = useActionState(resetPassword, initial);
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <FormMessage ok={state.ok}>{state.message}</FormMessage>
      ) : null}
      <input type="hidden" name="userId" value={userId} />
      <Field
        label="새 비밀번호"
        htmlFor="r-pw"
        error={state.errors?.newPassword}
        hint="8자 이상 · 사용자에게 직접 전달하세요"
      >
        <Input id="r-pw" name="newPassword" type="text" required />
      </Field>
      <SubmitButton pendingText="변경 중…" variant="secondary">
        비밀번호 초기화
      </SubmitButton>
    </form>
  );
}

export function BalanceForm({
  userId,
  year,
  grantedDays,
  adjustDays,
}: {
  userId: string;
  year: number;
  grantedDays: number;
  adjustDays: number;
}) {
  const [state, action] = useActionState(setBalance, initial);
  const years = [year - 1, year, year + 1];
  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <FormMessage ok={state.ok}>{state.message}</FormMessage>
      ) : null}
      <input type="hidden" name="userId" value={userId} />
      <div className="grid grid-cols-3 gap-3">
        <Field label="연도" htmlFor="b-year" error={state.errors?.year}>
          <Select id="b-year" name="year" defaultValue={String(year)}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="가용연차"
          htmlFor="b-granted"
          error={state.errors?.grantedDays}
        >
          <Input
            id="b-granted"
            name="grantedDays"
            type="number"
            step="0.5"
            min="0"
            defaultValue={grantedDays}
            required
          />
        </Field>
        <Field
          label="사용 조정"
          htmlFor="b-adjust"
          error={state.errors?.adjustDays}
          hint="+/- 수동 가감"
        >
          <Input
            id="b-adjust"
            name="adjustDays"
            type="number"
            step="0.5"
            defaultValue={adjustDays}
            required
          />
        </Field>
      </div>
      <p className="text-xs text-slate-500">
        사용연차 = 승인된 연차·반차 합계 + 사용 조정. 잔여연차 = 가용연차 − 사용연차.
      </p>
      <SubmitButton pendingText="저장 중…">연차 저장</SubmitButton>
    </form>
  );
}
