import type { NextFunction, Request, Response } from "express";

/** API 에러 코드 — docs/api-contract.md의 공통 에러 형식과 일치. */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "LLM_ERROR"
  | "INTERNAL";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  LLM_ERROR: 502,
  INTERNAL: 500,
};

/** 응답 본문: { error: { code, message } } */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
  }
}

/** async 라우트 핸들러의 예외를 next로 흘려보내는 래퍼. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

/** 중앙 에러 핸들러 — 모든 에러를 계약 형식으로 직렬화한다. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  // 예상하지 못한 에러는 내부 오류로 감싼다(상세는 서버 로그에만).
  console.error("[unhandled error]", err);
  res.status(500).json({
    error: { code: "INTERNAL", message: "서버 내부 오류가 발생했습니다." },
  });
}
