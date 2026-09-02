"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth/actions";
import { Field, Input, FormMessage, SubmitButton } from "@/components/ui";
import type { FormState } from "@/lib/form";

const initial: FormState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, initial);

  return (
    <form action={action} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.message ? <FormMessage>{state.message}</FormMessage> : null}

      <Field label="아이디" htmlFor="loginId" error={state.errors?.loginId}>
        <Input
          id="loginId"
          name="loginId"
          autoComplete="username"
          defaultValue={state.values?.loginId}
          required
        />
      </Field>

      <Field label="비밀번호" htmlFor="password" error={state.errors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <SubmitButton className="w-full" pendingText="로그인 중…">
        로그인
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
