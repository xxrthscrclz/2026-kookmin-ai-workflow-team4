import { z } from "zod";

/**
 * LLM이 생성하는 회의록 결과. 데이터 계약(schema.prisma / api-contract.md)과 일치한다.
 * mock 모드와 live 모드의 출력 스키마는 동일하다.
 */
export const MinutesSchema = z.object({
  agenda: z.array(z.string()), // 안건[]
  discussion: z.string(), // 논의요약
  decisions: z.array(z.string()), // 결정사항[]
});

export const GeneratedActionItemSchema = z.object({
  content: z.string(),
  // 불명확하면 "[담당자 확인 필요]" (AGENTS.md 규칙). null 허용.
  assignee: z.string().nullable(),
  // ISO8601 문자열 또는 null(미정).
  dueDate: z.string().nullable(),
});

export const GeneratedArtifactsSchema = z.object({
  title: z.string(),
  attendees: z.array(z.string()),
  minutes: MinutesSchema,
  actionItems: z.array(GeneratedActionItemSchema),
});

export type Minutes = z.infer<typeof MinutesSchema>;
export type GeneratedActionItem = z.infer<typeof GeneratedActionItemSchema>;
export type GeneratedArtifacts = z.infer<typeof GeneratedArtifactsSchema>;

/** 어댑터 입력: 전사본 + (선택) 사용자가 제공한 메타데이터. */
export interface GenerateInput {
  rawText: string;
  title?: string;
  attendees?: string[];
}

export type LlmMode = "mock" | "live";
