import type { GenerateInput, GeneratedActionItem, GeneratedArtifacts } from "./types.js";

/**
 * 키가 없을 때 쓰는 mock 생성기.
 * 전사본에서 휴리스틱으로 구조를 뽑아내며, 출력 스키마는 live 모드와 동일하다.
 * (전사본에 없는 사실을 지어내지 않도록, 본문에서 추출한 내용만 사용한다.)
 */
export function generateMock(input: GenerateInput): GeneratedArtifacts {
  const lines = input.rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sentences = input.rawText
    .split(/(?<=[.!?。…\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const title =
    input.title?.trim() ||
    stripBullet(lines[0] ?? "").slice(0, 60) ||
    "회의록 (제목 미정)";

  const attendees =
    input.attendees && input.attendees.length > 0
      ? input.attendees
      : extractAttendees(lines);

  // 안건: 글머리표/번호 목록 우선, 없으면 앞부분 문장에서 추출.
  const bulletItems = lines.filter((l) => /^([-*•]|\d+[.)])\s+/.test(l)).map(stripBullet);
  const agenda = (bulletItems.length > 0 ? bulletItems : sentences.slice(0, 3)).slice(0, 5);

  // 결정사항: 결정/합의 신호어가 있는 문장.
  const decisions = sentences
    .filter((s) => /(결정|합의|하기로 (했|함|결정)|확정)/.test(s))
    .slice(0, 5);

  // 논의요약: 앞 두 문장 정도로 압축.
  const discussion =
    sentences.slice(0, 2).join(" ").slice(0, 500) ||
    input.rawText.slice(0, 300);

  // 액션아이템: 할 일 신호어가 있는 문장.
  const actionItems: GeneratedActionItem[] = sentences
    .filter((s) => /(하기로|해야|담당|진행|준비|작성|확인|점검|까지)/.test(s))
    .slice(0, 8)
    .map((s) => ({
      content: s.slice(0, 200),
      assignee: extractAssignee(s),
      dueDate: null,
    }));

  return {
    title,
    attendees,
    minutes: { agenda, discussion, decisions },
    actionItems,
  };
}

function stripBullet(s: string): string {
  return s.replace(/^([-*•]|\d+[.)])\s+/, "").trim();
}

function extractAttendees(lines: string[]): string[] {
  const line = lines.find((l) => /^(참석자?|참가자?|attendees)\s*[:：]/i.test(l));
  if (!line) return [];
  const after = line.split(/[:：]/).slice(1).join(":");
  return after
    .split(/[,，、]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function extractAssignee(sentence: string): string {
  // "○○가/이/은/는 ... " 형태의 선행 주어를 담당자 후보로. 불명확하면 플레이스홀더.
  const m = sentence.match(/^\s*([가-힣A-Za-z]{2,10})(?:\s*[은는이가])/);
  return m?.[1] ?? "[담당자 확인 필요]";
}
