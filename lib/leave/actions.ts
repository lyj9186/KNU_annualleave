"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { revalidateLeaveViews, revalidateUserViews } from "@/lib/revalidate";
import { leaveRequestSchema, resolveEndDate } from "@/lib/leave/schema";
import { computeLeaveDays } from "@/lib/leave/calc";
import { isKrHoliday } from "@/lib/holidays/kr";
import { isHalfDay, LEAVE_TYPE_LABELS } from "@/lib/leave/types";
import { parseDateOnly } from "@/lib/datetime";
import { fieldErrors, readForm, type FormState } from "@/lib/form";

export async function createLeaveRequest(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const raw = readForm(formData, "type", "startDate", "endDate", "reason");

  // 마스터는 본인 연차를 등록하지 않고, 다른 사용자의 연차를 대리 등록한다.
  const isProxy = user.role === "MASTER";
  const targetIdRaw = String(formData.get("userId") ?? "").trim();

  if (isProxy && !targetIdRaw) {
    return { message: "대리 등록할 대상자를 선택하세요.", values: raw };
  }

  let targetUserId = user.id;
  let targetName: string | null = null;
  if (isProxy) {
    const target = await db.user.findUnique({
      where: { id: targetIdRaw },
      select: { id: true, name: true, role: true, status: true },
    });
    if (!target || target.role === "MASTER" || target.status !== "ACTIVE") {
      return { message: "대상 사용자를 찾을 수 없습니다.", values: raw };
    }
    targetUserId = target.id;
    targetName = target.name;
  }

  const parsed = leaveRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: raw };
  }

  const { type } = parsed.data;
  const startDate = parseDateOnly(parsed.data.startDate);
  const endDate = parseDateOnly(resolveEndDate(parsed.data));
  const days = computeLeaveDays(type, startDate, endDate, isKrHoliday);

  if (days <= 0) {
    return {
      errors: {
        startDate: ["선택한 기간에 근무일이 없습니다 (주말 · 공휴일 제외)."],
      },
      values: raw,
    };
  }

  // 기간이 겹치는 대상자의 대기/승인 신청 확인 (오전·오후 반차는 같은 날 공존 허용)
  const overlapping = await db.leaveRequest.findMany({
    where: {
      userId: targetUserId,
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
      message: isProxy
        ? `${targetName}님의 해당 기간에 이미 등록된 연차가 있습니다.`
        : "해당 기간에 이미 신청(대기 또는 승인)된 연차가 있습니다.",
      values: raw,
    };
  }

  const decided = isProxy
    ? {
        status: "APPROVED" as const,
        decidedById: user.id,
        decidedAt: new Date(),
        decisionNote: "마스터 대리 등록",
      }
    : { status: "PENDING" as const };

  await db.leaveRequest.create({
    data: {
      userId: targetUserId,
      type,
      startDate,
      endDate,
      days,
      reason: parsed.data.reason ? parsed.data.reason : null,
      ...decided,
    },
  });

  revalidateLeaveViews();
  if (isProxy) {
    revalidateUserViews(targetUserId);
    return {
      ok: true,
      message: `${targetName}님의 ${LEAVE_TYPE_LABELS[type]}를 등록했습니다. (승인 반영)`,
    };
  }
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
