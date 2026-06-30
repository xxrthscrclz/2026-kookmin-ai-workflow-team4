import { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import ActionCalendarDayPanel from '@/components/action-tracker/ActionCalendarDayPanel';
import type { ActionBoardItem } from '@/constants/actionTracker';
import {
  formatDateRange,
  getItemDateRange,
  rangeOverlapsMonth,
  toDateKey,
} from '@/utils/actionDateRange';
import { getAssigneeColor, getUniqueAssignees } from '@/utils/assigneeColor';
import { buildMonthWeeks, buildWeekBarSegments } from '@/utils/calendarWeekBars';

interface ActionCalendarProps {
  items: ActionBoardItem[];
  onItemClick?: (item: ActionBoardItem) => void;
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const BAR_ROW_HEIGHT = 22;

export default function ActionCalendar({ items, onItemClick }: ActionCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null);

  const itemsWithRange = useMemo(
    () =>
      items
        .map((item) => ({ item, range: getItemDateRange(item) }))
        .filter((entry): entry is { item: ActionBoardItem; range: NonNullable<typeof entry.range> } =>
          Boolean(entry.range),
        ),
    [items],
  );

  const monthWeeks = useMemo(
    () => buildMonthWeeks(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const weeksWithBars = useMemo(
    () =>
      monthWeeks.map((week) => {
        const segments = buildWeekBarSegments(week, itemsWithRange);
        const maxLane = segments.reduce((max, seg) => Math.max(max, seg.lane), -1);
        return { week, segments, barRows: maxLane + 1 };
      }),
    [monthWeeks, itemsWithRange],
  );

  const monthLabel = `${viewYear}년 ${viewMonth + 1}월`;
  const todayKey = toDateKey(today);

  const rangeItemsThisMonth = useMemo(
    () =>
      itemsWithRange
        .filter(({ range }) => rangeOverlapsMonth(range, viewYear, viewMonth))
        .map(({ item }) => item)
        .sort((a, b) => {
          const aStart = getItemDateRange(a)?.start.getTime() ?? 0;
          const bStart = getItemDateRange(b)?.start.getTime() ?? 0;
          return aStart - bStart;
        }),
    [itemsWithRange, viewYear, viewMonth],
  );

  const assigneeLegend = useMemo(() => getUniqueAssignees(items), [items]);

  const selectDate = (dateKey: string | null, itemId?: string) => {
    if (!dateKey) return;
    setSelectedDateKey(dateKey);
    setHighlightItemId(itemId ?? null);
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
      return;
    }
    setViewMonth((m) => m - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
      return;
    }
    setViewMonth((m) => m - 1);
  };

  return (
    <Card
      title="일정 캘린더"
      description="날짜나 일정 바를 누르면 그날 해야 할 일·진행 상태를 확인할 수 있습니다."
    >
      <div className="flex flex-col gap-6">
        {assigneeLegend.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {assigneeLegend.map((assignee) => {
              const color = getAssigneeColor(assignee);
              return (
                <div
                  key={assignee}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${color.badgeBg} ${color.badgeText}`}
                >
                  <div className={`h-2 w-2 rounded-full ${color.calendarBar}`} />
                  {assignee}
                </div>
              );
            })}
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${getAssigneeColor(null).badgeBg} ${getAssigneeColor(null).badgeText}`}
            >
              <div className={`h-2 w-2 rounded-full ${getAssigneeColor(null).calendarBar}`} />
              담당자 미정
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goPrevMonth}
            className="rounded-lg glass px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            이전
          </button>
          <div className="text-base font-semibold text-text-primary">{monthLabel}</div>
          <button
            type="button"
            onClick={goNextMonth}
            className="rounded-lg glass px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            다음
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label, index) => (
              <div
                key={label}
                className={`py-1 text-center text-xs font-medium ${
                  index === 0 ? 'text-error' : index === 6 ? 'text-primary' : 'text-text-muted'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {weeksWithBars.map(({ week, segments, barRows }, weekIndex) => {
            return (
              <div key={`week-${weekIndex}`} className="flex flex-col gap-1">
                <div className="grid grid-cols-7 gap-1">
                  {week.map((cell, colIndex) => {
                    const isToday = cell.dateKey === todayKey;
                    const isSelected = cell.dateKey === selectedDateKey;

                    return (
                      <button
                        key={`day-${weekIndex}-${colIndex}`}
                        type="button"
                        disabled={!cell.dateKey}
                        onClick={() => selectDate(cell.dateKey)}
                        className={`flex min-h-7 items-start justify-end rounded-md border p-1 transition-colors ${
                          !cell.dateKey
                            ? 'cursor-default border-transparent'
                            : isSelected
                              ? 'border-primary bg-primary-subtle'
                              : isToday
                                ? 'border-primary/50 bg-primary-subtle/50 hover:bg-primary-subtle'
                                : 'border-transparent hover:bg-bg-muted'
                        }`}
                      >
                        {cell.day !== null && (
                          <div
                            className={`text-xs font-medium ${
                              isToday || isSelected ? 'text-primary' : 'text-text-secondary'
                            }`}
                          >
                            {cell.day}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div
                  className="grid grid-cols-7 gap-1"
                  style={{ gridTemplateRows: `repeat(${Math.max(barRows, 1)}, ${BAR_ROW_HEIGHT}px)` }}
                >
                  {segments.map((segment) => {
                    const color = getAssigneeColor(segment.item.assignee);
                    const radius =
                      `${segment.roundLeft ? 'rounded-l-md' : 'rounded-l-none'} ` +
                      `${segment.roundRight ? 'rounded-r-md' : 'rounded-r-none'}`;
                    const segmentDateKey = week[segment.startCol].dateKey;

                    return (
                      <button
                        key={`${segment.item.id}-${weekIndex}-${segment.startCol}-${segment.lane}`}
                        type="button"
                        onClick={() => selectDate(segmentDateKey, segment.item.id)}
                        className={`flex h-5 cursor-pointer items-center truncate px-1.5 text-[10px] leading-none transition-opacity hover:opacity-90 ${color.calendarBar} ${color.badgeText} ${radius} ${
                          highlightItemId === segment.item.id && selectedDateKey === segmentDateKey
                            ? 'ring-2 ring-primary ring-offset-1'
                            : ''
                        }`}
                        style={{
                          gridColumn: `${segment.startCol + 1} / span ${segment.span}`,
                          gridRow: segment.lane + 1,
                        }}
                        title={segment.item.content}
                      >
                        {segment.showLabel ? segment.item.content : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {selectedDateKey && (
          <ActionCalendarDayPanel
            dateKey={selectedDateKey}
            items={items}
            highlightItemId={highlightItemId}
            onItemClick={onItemClick}
            onClose={() => {
              setSelectedDateKey(null);
              setHighlightItemId(null);
            }}
          />
        )}

        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-text-primary">
            이번 달 일정 ({rangeItemsThisMonth.length})
          </div>
          {rangeItemsThisMonth.length === 0 ? (
            <div className="text-sm text-text-muted">이번 달에 표시할 일정이 없습니다.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {rangeItemsThisMonth.map((item) => {
                const color = getAssigneeColor(item.assignee);
                const rangeLabel = formatDateRange(item);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onItemClick?.(item)}
                    className="flex flex-wrap items-center gap-2 rounded-lg glass px-3 py-2 text-left text-sm transition-colors hover:bg-bg-muted"
                  >
                    <div className={`rounded-full px-2 py-0.5 text-xs ${color.badgeBg} ${color.badgeText}`}>
                      {item.assignee ?? '담당자 미정'}
                    </div>
                    <div className="font-medium text-text-primary">{rangeLabel}</div>
                    <div className="text-text-primary">{item.content}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
