import "server-only";

import { revalidatePath } from "next/cache";

/** 연차 신청/결재가 바뀌면 영향받는 화면들 */
export function revalidateLeaveViews(): void {
  revalidatePath("/main");
  revalidatePath("/leave");
  revalidatePath("/approvals");
  revalidatePath("/status");
}

/** 계정/잔여가 바뀌면 영향받는 화면들 */
export function revalidateUserViews(userId?: string): void {
  revalidatePath("/settings");
  revalidatePath("/main");
  if (userId) revalidatePath(`/settings/${userId}`);
}
