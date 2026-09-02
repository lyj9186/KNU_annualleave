import { z } from "zod";

export const decisionSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["approve", "reject", "cancel"]),
  note: z
    .string()
    .trim()
    .max(200, { error: "메모는 200자 이하로 입력하세요." })
    .optional()
    .or(z.literal("")),
});

export type DecisionAction = z.infer<typeof decisionSchema>["action"];
