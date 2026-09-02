import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  error?: string[] | string;
  children: ReactNode;
  hint?: string;
}) {
  const errText = Array.isArray(error) ? error[0] : error;
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !errText ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
      {errText ? <p className="mt-1 text-xs text-danger">{errText}</p> : null}
    </div>
  );
}
