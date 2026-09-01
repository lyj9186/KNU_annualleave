"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type Variant = ComponentProps<typeof Button>["variant"];

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  size = "md",
  className,
  formAction,
  name,
  value,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      formAction={formAction}
      name={name}
      value={value}
    >
      {pending ? (pendingText ?? "처리 중…") : children}
    </Button>
  );
}
