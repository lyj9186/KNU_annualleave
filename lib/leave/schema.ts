import { z } from "zod";
import { parseDateOnly } from "@/lib/datetime";

export const leaveTypeEnum = z.enum(["ANNUAL", "HALF_AM", "HALF_PM", "SICK"]);

/** 반차이거나 종료일 미지정이면 종료일 = 시작일 */
export function resolveEndDate(v: {
  type: string;
  startDate: string;
  endDate?: string | null;
}): string {
  if (v.type === "HALF_AM" || v.type === "HALF_PM") return v.startDate;
  return v.endDate ? v.endDate : v.startDate;
}

export const leaveRequestSchema = z
  .object({
    type: leaveTypeEnum,
    startDate: z.iso.date({ error: "시작일을 선택하세요." }),
    endDate: z.iso
      .date({ error: "종료일을 선택하세요." })
      .optional()
      .or(z.literal("")),
    reason: z
      .string()
      .trim()
      .max(200, { error: "사유는 200자 이하로 입력하세요." })
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (v) => parseDateOnly(resolveEndDate(v)) >= parseDateOnly(v.startDate),
    {
      error: "종료일은 시작일과 같거나 이후여야 합니다.",
      path: ["endDate"],
    },
  );
