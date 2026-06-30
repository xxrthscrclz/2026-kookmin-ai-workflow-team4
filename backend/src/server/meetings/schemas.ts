import { z } from "zod";

/** POST /api/meetings 요청 본문. rawText만 필수, 나머지는 선택(미제공 시 AI 추론). */
export const CreateMeetingSchema = z.object({
  rawText: z.string().trim().min(1, "rawText는 필수입니다."),
  title: z.string().trim().min(1).optional(),
  date: z
    .string()
    .datetime({ message: "date는 ISO8601 문자열이어야 합니다." })
    .optional(),
  attendees: z.array(z.string().trim().min(1)).optional(),
});

export type CreateMeetingInput = z.infer<typeof CreateMeetingSchema>;

/** GET /api/meetings 페이지네이션 쿼리. */
export const ListMeetingsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListMeetingsQuery = z.infer<typeof ListMeetingsQuerySchema>;
