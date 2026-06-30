import type { ActionBoardItem } from '@/constants/actionTracker';
import { getAssigneeColor } from '@/utils/assigneeColor';

interface ActionCardProps {
  item: ActionBoardItem;
  onClick: () => void;
  draggable?: boolean;
  isDragging?: boolean;
  isMoving?: boolean;
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: () => void;
}

function formatDateLabel(date: string | null, fallback: string) {
  return date ?? fallback;
}

export default function ActionCard({
  item,
  onClick,
  draggable = false,
  isDragging = false,
  isMoving = false,
  onDragStart,
  onDragEnd,
}: ActionCardProps) {
  const assigneeColor = getAssigneeColor(item.assignee);

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      className={`glass w-full cursor-grab rounded-xl p-4 text-left transition-colors active:cursor-grabbing hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
        isDragging ? 'opacity-40' : ''
      } ${isMoving ? 'pointer-events-none opacity-60' : ''}`}
    >
      <div className="text-sm font-medium text-text-primary">{item.content}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
        <div className={`rounded-full px-2 py-0.5 ${assigneeColor.badgeBg} ${assigneeColor.badgeText}`}>
          {item.assignee ?? '담당자 미정'}
        </div>
        <div className="rounded-full glass px-2 py-0.5">
          시작 {formatDateLabel(item.startDate, '미정')}
        </div>
        <div className="rounded-full glass px-2 py-0.5">
          마감 {formatDateLabel(item.dueDate, '미정')}
        </div>
        <div className="rounded-full bg-primary-subtle px-2 py-0.5 text-primary">
          {item.meeting}
        </div>
        {item.memo.trim() && (
          <div className="rounded-full bg-bg-muted px-2 py-0.5 text-text-muted">메모 있음</div>
        )}
      </div>
    </div>
  );
}
