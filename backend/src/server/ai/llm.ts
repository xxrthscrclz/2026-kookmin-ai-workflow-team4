import { generateLive, readLiveConfig } from "./live.js";
import { generateMock } from "./mock.js";
import type { GenerateInput, GeneratedArtifacts, LlmMode } from "./types.js";

/**
 * LLM 어댑터의 단일 진입점.
 * - LLM_API_KEY가 있으면 live 모드, 없으면 mock 모드.
 * - 두 모드의 출력 스키마는 동일하다(GeneratedArtifacts).
 */
export function getLlmMode(): LlmMode {
  return readLiveConfig() ? "live" : "mock";
}

export async function generateMeetingArtifacts(
  input: GenerateInput,
): Promise<GeneratedArtifacts> {
  const config = readLiveConfig();
  if (config) {
    return generateLive(input, config);
  }
  return generateMock(input);
}

export type { GenerateInput, GeneratedArtifacts, LlmMode } from "./types.js";
