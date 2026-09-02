"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { revalidateLeaveViews } from "@/lib/revalidate";
import { leaveRequestSchema, resolveEndDate } from "@/lib/leave/schema";
import { computeLeaveDays } from "@/lib/leave/calc";
import { isHalfDay } from "@/lib/leave/types";
import { parseDateOnly } from "@/lib/datetime";
import { fieldErrors, readForm, type FormState } from "@/lib/form";

export async function createLeaveRequest(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const raw = readForm(formData, "type", "startDate", "endDate", "reason");

  const parsed = leaveRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: raw };
  }

  const { type } = parsed.data;
  const startDate = parseDateOnly(parsed.data.startDate);
  const endDate = parseDateOnly(resolveEndDate(parsed.data));
  const days = computeLeaveDays(type, startDate, endDate);

  if (days <= 0) {
    return {
      errors: { startDate: ["선택한 기간에 영업일(월~금)이 없습니다."] },
      values: raw,
    };
  }

  // 기간이 겹치는 본인의 대기/승인 신청 확인 (오전·오후 반차는 같은 날 공존 허용)
  const overlapping = await db.leaveRequest.findMany({
    where: {
      userId: user.id,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    select: { type: true, startDate: true, endDate: true },
  });

  const conflict = overlapping.some((o) => {
    const sameSingleDay =
      o.startDate.getTime() === startDate.getTime() &&
      o.endDate.getTime() === endDate.getTime() &&
      startDate.getTime() === endDate.getTime();
    const halfPair =
      sameSingleDay &&
      isHalfDay(type) &&
      isHalfDay(o.type) &&
      o.type !== type;
    return !halfPair;
  });

  if (conflict) {
    return {
      message: "해당 기간에 이미 신청(대기 또는 승인)된 연차가 있습니다.",
      values: raw,
    };
  }

  await db.leaveRequest.create({
    data: {
      userId: user.id,
      type,
      startDate,
      endDate,
      days,
      reason: parsed.data.reason ? parsed.data.reason : null,
      status: "PENDING",
    },
  });

  revalidateLeaveViews();
  return { ok: true, message: "연차를 신청했습니다. 팀장 승인을 기다려 주세요." };
}

export async function withdrawLeaveRequest(formData: FormData): Promise<void> {
  const user = await requireUser();
  const { requestId } = readForm(formData, "requestId");
  if (!requestId) return;

  const req = await db.leaveRequest.findUnique({ where: { id: requestId } });
  if (!req || req.userId !== user.id || req.status !== "PENDING") return;

  await db.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: "CANCELLED",
      decidedById: user.id,
      decidedAt: new Date(),
      decisionNote: "본인 철회",
    },
  });

  revalidateLeaveViews();
}
