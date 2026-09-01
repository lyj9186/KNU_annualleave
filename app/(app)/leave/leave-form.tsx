"use client";

import { useActionState, useState } from "react";
import { createLeaveRequest } from "./actions";
import { Field, Input, Select, Textarea, FormMessage } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  LEAVE_TYPE_LABELS,
  computeLeaveDays,
  isHalfDay,
  type LeaveType,
} from "@/lib/leave";
import { parseDateOnly } from "@/lib/validation";
import { daysKo } from "@/lib/format";
import type { FormState } from "@/lib/validation";

const initial: FormState = {};
const TYPES: LeaveType[] = ["ANNUAL", "HALF_AM", "HALF_PM", "SICK"];

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function LeaveForm() {
  const [state, action] = useActionState(createLeaveRequest, initial);
  const [type, setType] = useState<LeaveType>("ANNUAL");
  const [start, setStart] = useState(todayIso());
  const [end, setEnd] = useState(todayIso());

  const half = isHalfDay(type);
  const effectiveEnd = half ? start : end;

  let preview = "";
  if (start && effectiveEnd) {
    const s = parseDateOnly(start);
    const e = parseDateOnly(effectiveEnd);
    if (e >= s) {
      const d = computeLeaveDays(type, s, e);
      preview =
        d > 0
          ? `신청 일수: ${daysKo(d)}${type === "SICK" ? " (연차 미차감)" : ""}`
          : "선택한 기간에 영업일(월~금)이 없습니다.";
    } else {
      preview = "종료일이 시작일보다 빠릅니다.";
    }
  }

  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <FormMessage ok={state.ok}>{state.message}</FormMessage>
      ) : null}

      <Field label="종류" htmlFor="type" error={state.errors?.type}>
        <Select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as LeaveType)}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {LEAVE_TYPE_LABELS[t]}
              {t === "ANNUAL" ? " (1일)" : ""}
              {t === "HALF_AM" || t === "HALF_PM" ? " (0.5일)" : ""}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="시작일" htmlFor="startDate" error={state.errors?.startDate}>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              if (half || e.target.value > end) setEnd(e.target.value);
            }}
            required
          />
        </Field>
        <Field label="종료일" htmlFor="endDate" error={state.errors?.endDate}>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={effectiveEnd}
            min={start}
            onChange={(e) => setEnd(e.target.value)}
            disabled={half}
            required
          />
        </Field>
      </div>

      {preview ? (
        <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
          {preview}
        </p>
      ) : null}

      <Field label="사유 (선택)" htmlFor="reason" error={state.errors?.reason}>
        <Textarea id="reason" name="reason" rows={2} maxLength={200} />
      </Field>

      <SubmitButton pendingText="신청 중…">연차 신청</SubmitButton>
    </form>
  );
}
