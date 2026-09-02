"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, "type"> & {
  children: ReactNode;
  /** 제출 중 표시할 텍스트 (기본: "처리 중…") */
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "처리 중…",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
