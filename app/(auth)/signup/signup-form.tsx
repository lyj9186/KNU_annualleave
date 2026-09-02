"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/auth/actions";
import { Field, Input, FormMessage, SubmitButton } from "@/components/ui";
import type { FormState } from "@/lib/form";

const initial: FormState = {};

export function SignupForm() {
  const [state, action] = useActionState(signup, initial);

  if (state.ok) {
    return (
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <FormMessage ok>{state.message}</FormMessage>
        <Link
          href="/login"
          className="inline-block font-medium text-blue-600 hover:underline"
        >
          로그인 페이지로
        </Link>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state.message ? <FormMessage>{state.message}</FormMessage> : null}

      <Field
        label="아이디"
        htmlFor="loginId"
        error={state.errors?.loginId}
        hint="영문/숫자/._- 3~30자"
      >
        <Input
          id="loginId"
          name="loginId"
          autoComplete="username"
          defaultValue={state.values?.loginId}
          required
        />
      </Field>

      <Field label="이름" htmlFor="name" error={state.errors?.name}>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={state.values?.name}
          required
        />
      </Field>

      <Field
        label="비밀번호"
        htmlFor="password"
        error={state.errors?.password}
        hint="8자 이상"
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

      <Field
        label="비밀번호 확인"
        htmlFor="confirmPassword"
        error={state.errors?.confirmPassword}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>

      <SubmitButton className="w-full" pendingText="신청 중…">
        가입 신청
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
