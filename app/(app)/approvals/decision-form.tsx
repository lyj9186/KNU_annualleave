"use client";

import { useActionState } from "react";
import { decideLeaveRequest } from "./actions";
import { Button } from "@/components/ui";
import type { FormState } from "@/lib/form";
import type { LeaveStatus } from "@/lib/leave";

const initial: FormState = {};

export function DecisionForm({
  requestId,
  status,
}: {
  requestId: string;
  status: LeaveStatus;
}) {
  const [state, action, pending] = useActionState(decideLeaveRequest, initial);

  if (status !== "PENDING" && status !== "APPROVED") {
    return state.message ? (
      <span className="text-xs text-slate-500">{state.message}</span>
    ) : null;
  }

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="requestId" value={requestId} />
      <input
        name="note"
        placeholder="메모(선택)"
        maxLength={200}
        className="h-7 w-32 rounded border border-slate-300 px-2 text-xs focus:border-blue-500 focus:outline-none"
      />
      <div className="flex gap-1">
        {status === "PENDING" ? (
          <>
            <Button
              type="submit"
              name="action"
              value="approve"
              size="sm"
              variant="success"
              disabled={pending}
            >
              승인
            </Button>
            <Button
              type="submit"
              name="action"
              value="reject"
              size="sm"
              variant="danger"
              disabled={pending}
            >
              반려
            </Button>
          </>
        ) : null}
        <Button
          type="submit"
          name="action"
          value="cancel"
          size="sm"
          variant="outline"
          disabled={pending}
        >
          취소
        </Button>
      </div>
      {state.message ? (
        <span
          className={`text-xs ${state.ok ? "text-emerald-600" : "text-rose-600"}`}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
