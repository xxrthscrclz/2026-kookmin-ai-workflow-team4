import { buildApp } from "./app.js";
import { getLlmMode } from "./server/ai/llm.js";

const PORT = Number(process.env.PORT ?? 8080);

buildApp().listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT} (LLM mode: ${getLlmMode()})`);
});
