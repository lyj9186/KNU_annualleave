"use client";

import { useActionState } from "react";
import { decideLeaveRequest } from "@/lib/approvals/actions";
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
      <span className="text-xs text-muted">{state.message}</span>
    ) : null;
  }

  return (
    <form
      action={action}
      className="flex flex-col items-stretch gap-1.5 sm:items-end"
    >
      <input type="hidden" name="requestId" value={requestId} />
      <input
        name="note"
        placeholder="메모(선택)"
        maxLength={200}
        className="h-8 w-full rounded border border-line-strong px-2 text-xs focus:border-brand-ring focus:outline-none sm:h-7 sm:w-40"
      />
      <div className="flex gap-1 sm:justify-end">
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
          className={`text-xs ${state.ok ? "text-emerald-600" : "text-danger"}`}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
