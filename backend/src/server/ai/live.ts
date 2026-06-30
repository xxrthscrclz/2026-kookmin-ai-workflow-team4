import { ApiError } from "../http/errors.js";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompts.js";
import { GeneratedArtifactsSchema, type GenerateInput, type GeneratedArtifacts } from "./types.js";

interface LiveConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function readLiveConfig(): LiveConfig | null {
  const apiKey = process.env.LLM_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: (process.env.LLM_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.LLM_MODEL?.trim() || "gpt-4o-mini",
  };
}

/**
 * OpenAI 호환 Chat Completions로 회의록을 생성한다.
 * JSON 모드를 사용하고, 응답을 계약 스키마로 검증한다.
 */
export async function generateLive(
  input: GenerateInput,
  config: LiveConfig,
): Promise<GeneratedArtifacts> {
  let res: Response;
  try {
    res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
      }),
    });
  } catch (cause) {
    throw new ApiError("LLM_ERROR", `LLM 호출에 실패했습니다: ${(cause as Error).message}`);
  }

  if (!res.ok) {
    throw new ApiError("LLM_ERROR", `LLM 응답 오류 (status ${res.status}).`);
  }

  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new ApiError("LLM_ERROR", "LLM 응답이 비어 있습니다.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ApiError("LLM_ERROR", "LLM 응답을 JSON으로 파싱할 수 없습니다.");
  }

  const result = GeneratedArtifactsSchema.safeParse(parsed);
  if (!result.success) {
    throw new ApiError("LLM_ERROR", "LLM 응답이 회의록 스키마와 일치하지 않습니다.");
  }
  return result.data;
}
