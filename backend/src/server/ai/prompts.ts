import type { GenerateInput } from "./types.js";

/**
 * 회의록 생성 시스템 프롬프트.
 * - 전사본에 없는 사실을 지어내지 않는다(AGENTS.md 규칙).
 * - 담당자 불명확 → "[담당자 확인 필요]", 기한 불명확 → null.
 * - 반드시 지정된 JSON 스키마로만 응답한다.
 */
export const SYSTEM_PROMPT = `당신은 회의 전사본을 구조화된 회의록으로 정리하는 어시스턴트입니다.
규칙:
1. 전사본에 명시되지 않은 사실, 결정, 담당자를 절대 지어내지 마세요.
2. 액션아이템의 담당자가 분명하지 않으면 반드시 문자열 "[담당자 확인 필요]"로 표기하세요. (assignee를 null로 두지 마세요.)
3. 액션아이템의 기한이 분명하지 않으면 dueDate를 null로 두세요. 분명하면 ISO8601 날짜 문자열로 표기하세요.
4. 회의 제목/참석자가 사용자 입력으로 주어지면 그 값을 우선 사용하고, 없으면 전사본에서 추론하세요.
5. 출력은 아래 JSON 스키마를 정확히 따르는 JSON 객체 하나만 반환하세요. 그 외 텍스트는 출력하지 마세요.

JSON 스키마:
{
  "title": string,
  "attendees": string[],
  "minutes": {
    "agenda": string[],      // 안건 목록
    "discussion": string,    // 논의 요약 (문단)
    "decisions": string[]    // 결정 사항 목록
  },
  "actionItems": [
    { "content": string, "assignee": string | null, "dueDate": string | null }
  ]
}`;

export function buildUserPrompt(input: GenerateInput): string {
  const meta: string[] = [];
  if (input.title) meta.push(`제목(사용자 제공): ${input.title}`);
  if (input.attendees && input.attendees.length > 0) {
    meta.push(`참석자(사용자 제공): ${input.attendees.join(", ")}`);
  }
  const metaBlock = meta.length > 0 ? `${meta.join("\n")}\n\n` : "";
  return `${metaBlock}전사본:\n"""\n${input.rawText}\n"""`;
}
