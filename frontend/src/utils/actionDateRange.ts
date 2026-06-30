import type { ActionBoardItem } from '@/constants/actionTracker';

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toDateKeyFromParts(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/** 시작일·마감일 중 하나라도 있으면 구간 반환. 둘 다 없으면 null. */
export function getItemDateRange(item: ActionBoardItem): { start: Date; end: Date } | null {
  const startKey = item.startDate ?? item.dueDate;
  const endKey = item.dueDate ?? item.startDate;
  if (!startKey || !endKey) return null;

  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (start.getTime() <= end.getTime()) {
    return { start, end };
  }
  return { start: end, end: start };
}

export function isDateInRange(date: Date, range: { start: Date; end: Date }): boolean {
  const time = date.getTime();
  return time >= range.start.getTime() && time <= range.end.getTime();
}

export function formatDateRange(item: ActionBoardItem): string | null {
  const range = getItemDateRange(item);
  if (!range) return null;
  const start = toDateKey(range.start);
  const end = toDateKey(range.end);
  return start === end ? start : `${start} ~ ${end}`;
}

export function rangeOverlapsMonth(
  range: { start: Date; end: Date },
  year: number,
  month: number,
): boolean {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  return range.start.getTime() <= monthEnd.getTime() && range.end.getTime() >= monthStart.getTime();
}
