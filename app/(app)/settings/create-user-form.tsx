"use client";

import { useActionState } from "react";
import { createUser } from "./actions";
import { Field, Input, Select, FormMessage } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { DEFAULT_ANNUAL_DAYS, ROLE_LABELS } from "@/lib/leave";
import type { FormState } from "@/lib/validation";

const initial: FormState = {};

export function CreateUserForm() {
  const [state, action] = useActionState(createUser, initial);

  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <FormMessage ok={state.ok}>{state.message}</FormMessage>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="아이디" htmlFor="c-loginId" error={state.errors?.loginId}>
          <Input id="c-loginId" name="loginId" required />
        </Field>
        <Field label="이름" htmlFor="c-name" error={state.errors?.name}>
          <Input id="c-name" name="name" required />
        </Field>
        <Field
          label="초기 비밀번호"
          htmlFor="c-password"
          error={state.errors?.password}
          hint="8자 이상"
        >
          <Input id="c-password" name="password" type="text" required />
        </Field>
        <Field label="역할" htmlFor="c-role" error={state.errors?.role}>
          <Select id="c-role" name="role" defaultValue="USER">
            {(["USER", "TEAM_LEAD", "MASTER"] as const).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="올해 가용연차"
          htmlFor="c-granted"
          error={state.errors?.grantedDays}
        >
          <Input
            id="c-granted"
            name="grantedDays"
            type="number"
            step="0.5"
            min="0"
            defaultValue={DEFAULT_ANNUAL_DAYS}
            required
          />
        </Field>
      </div>

      <SubmitButton pendingText="생성 중…">계정 생성</SubmitButton>
    </form>
  );
}
