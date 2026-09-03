/** 연차 도메인 타입 · 라벨 (클라이언트 공용) */
import {
  LeaveStatus,
  LeaveType,
  Role,
  UserStatus,
} from "@/lib/generated/prisma/enums";

export { LeaveStatus, LeaveType, Role, UserStatus };

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL: "연차",
  HALF_AM: "오전 반차",
  HALF_PM: "오후 반차",
  SICK: "병가",
  PUBLIC: "공가",
};

export const LEAVE_TYPE_SHORT: Record<LeaveType, string> = {
  ANNUAL: "연차",
  HALF_AM: "오전반차",
  HALF_PM: "오후반차",
  SICK: "병가",
  PUBLIC: "공가",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELLED: "취소",
};

export const ROLE_LABELS: Record<Role, string> = {
  MASTER: "마스터",
  TEAM_LEAD: "팀장",
  USER: "사용자",
};

/** 목록 정렬 우선순위 (마스터 → 팀장 → 사용자) */
export const ROLE_ORDER: Record<Role, number> = {
  MASTER: 0,
  TEAM_LEAD: 1,
  USER: 2,
};

/** 계정 상태 정렬 우선순위 (승인대기 → 활성 → 비활성) */
export const USER_STATUS_ORDER: Record<UserStatus, number> = {
  PENDING: 0,
  ACTIVE: 1,
  DISABLED: 2,
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  PENDING: "승인대기",
  ACTIVE: "활성",
  DISABLED: "비활성",
};

/** 종류 선택 순서 */
export const LEAVE_TYPES: LeaveType[] = [
  "ANNUAL",
  "HALF_AM",
  "HALF_PM",
  "SICK",
  "PUBLIC",
];
/** 역할 선택 순서 (폼) */
export const ROLE_OPTIONS: Role[] = ["USER", "TEAM_LEAD", "MASTER"];
/** 계정 상태 선택 순서 (폼) */
export const USER_STATUS_OPTIONS: UserStatus[] = [
  "ACTIVE",
  "PENDING",
  "DISABLED",
];
/** 상태 탭 순서 */
export const LEAVE_STATUSES: LeaveStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

/** 반차 여부 */
export function isHalfDay(type: LeaveType): boolean {
  return type === "HALF_AM" || type === "HALF_PM";
}

/** 연차 잔여에서 차감하지 않는 종류 (병가 · 공가) */
export function isExempt(type: LeaveType): boolean {
  return type === "SICK" || type === "PUBLIC";
}

/** 연차에서 차감되는 종류인지 (병가 · 공가는 차감하지 않음) */
export function isDeductible(type: LeaveType): boolean {
  return !isExempt(type);
}
