export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ?? 'http://127.0.0.1:8080';

/** true면 로컬 목업 데이터 사용, false면 백엔드 API 호출 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const apiUrl = (path: string) => {
  const base = SERVER_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
};
