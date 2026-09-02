"use server";

import { db } from "@/lib/db";
import { requireApprover } from "@/lib/auth/dal";
import { revalidateLeaveViews } from "@/lib/revalidate";
import { readForm, type FormState } from "@/lib/form";
import type { LeaveStatus } from "@/lib/leave/types";
import { decisionSchema, type DecisionAction } from "@/lib/approvals/schema";

const TRANSITION: Record<
  DecisionAction,
  { next: LeaveStatus; from: LeaveStatus[]; denyMessage: string; label: string }
> = {
  approve: {
    next: "APPROVED",
    from: ["PENDING"],
    denyMessage: "대기 중인 신청만 승인할 수 있습니다.",
    label: "승인",
  },
  reject: {
    next: "REJECTED",
    from: ["PENDING"],
    denyMessage: "대기 중인 신청만 반려할 수 있습니다.",
    label: "반려",
  },
  cancel: {
    next: "CANCELLED",
    from: ["PENDING", "APPROVED"],
    denyMessage: "대기 또는 승인 상태의 신청만 취소할 수 있습니다.",
    label: "취소",
  },
};

export async function decideLeaveRequest(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const approver = await requireApprover();

  const parsed = decisionSchema.safeParse(
    readForm(formData, "requestId", "action", "note"),
  );
  if (!parsed.success) {
    return { message: "요청이 올바르지 않습니다." };
  }

  const { requestId, action, note } = parsed.data;
  const req = await db.leaveRequest.findUnique({ where: { id: requestId } });
  if (!req) return { message: "신청을 찾을 수 없습니다." };

  if (req.userId === approver.id && approver.role !== "MASTER") {
    return { message: "본인 신청은 다른 승인자가 처리해야 합니다." };
  }

  const t = TRANSITION[action];
  if (!t.from.includes(req.status)) {
    return { message: t.denyMessage };
  }

  await db.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: t.next,
      decidedById: approver.id,
      decidedAt: new Date(),
      decisionNote: note || null,
    },
  });

  revalidateLeaveViews();
  return { ok: true, message: `${t.label} 처리되었습니다.` };
}
