"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireApprover } from "@/lib/dal";
import { decisionSchema } from "@/lib/validation";
import type { FormState } from "@/lib/form";

export async function decideLeaveRequest(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const approver = await requireApprover();

  const parsed = decisionSchema.safeParse({
    requestId: String(formData.get("requestId") ?? ""),
    action: String(formData.get("action") ?? ""),
    note: String(formData.get("note") ?? ""),
  });
  if (!parsed.success) {
    return { message: "요청이 올바르지 않습니다." };
  }

  const { requestId, action, note } = parsed.data;
  const req = await db.leaveRequest.findUnique({ where: { id: requestId } });
  if (!req) return { message: "신청을 찾을 수 없습니다." };

  if (req.userId === approver.id && approver.role !== "MASTER") {
    return { message: "본인 신청은 다른 승인자가 처리해야 합니다." };
  }

  if (action === "approve") {
    if (req.status !== "PENDING") {
      return { message: "대기 중인 신청만 승인할 수 있습니다." };
    }
    await db.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        decidedById: approver.id,
        decidedAt: new Date(),
        decisionNote: note || null,
      },
    });
  } else if (action === "reject") {
    if (req.status !== "PENDING") {
      return { message: "대기 중인 신청만 반려할 수 있습니다." };
    }
    await db.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        decidedById: approver.id,
        decidedAt: new Date(),
        decisionNote: note || null,
      },
    });
  } else {
    // cancel
    if (req.status !== "PENDING" && req.status !== "APPROVED") {
      return { message: "대기 또는 승인 상태의 신청만 취소할 수 있습니다." };
    }
    await db.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: "CANCELLED",
        decidedById: approver.id,
        decidedAt: new Date(),
        decisionNote: note || null,
      },
    });
  }

  revalidatePath("/approvals");
  revalidatePath("/main");
  revalidatePath("/leave");

  const label =
    action === "approve" ? "승인" : action === "reject" ? "반려" : "취소";
  return { ok: true, message: `${label} 처리되었습니다.` };
}
