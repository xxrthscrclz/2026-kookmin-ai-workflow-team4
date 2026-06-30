import { useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import ActionCard from '@/components/action-tracker/ActionCard';
import {
  ACTION_STATUS_COLUMNS,
  type ActionBoardItem,
  type ActionBoardStatus,
} from '@/constants/actionTracker';

interface ActionKanbanBoardProps {
  itemsByStatus: Record<ActionBoardStatus, ActionBoardItem[]>;
  loading?: boolean;
  onItemClick: (item: ActionBoardItem) => void;
  onStatusChange: (id: string, status: ActionBoardStatus) => Promise<void>;
}

export default function ActionKanbanBoard({
  itemsByStatus,
  loading = false,
  onItemClick,
  onStatusChange,
}: ActionKanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ActionBoardStatus | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const draggedRef = useRef(false);

  const handleDragStart = (id: string, event: React.DragEvent) => {
    draggedRef.current = true;
    setDraggingId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTarget(null);
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  };

  const handleDrop = async (status: ActionBoardStatus) => {
    const id = draggingId;
    setDraggingId(null);
    setDropTarget(null);

    if (!id) return;

    const item = Object.values(itemsByStatus)
      .flat()
      .find((entry) => entry.id === id);
    if (!item || item.status === status) return;

    setMovingId(id);
    try {
      await onStatusChange(id, status);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {ACTION_STATUS_COLUMNS.map((column) => {
        const columnItems = itemsByStatus[column.id];
        const isDropTarget = dropTarget === column.id;

        return (
          <Card
            key={column.id}
            title={`${column.label} (${columnItems.length})`}
            className={isDropTarget ? 'ring-2 ring-primary/40' : ''}
          >
            <div
              className={`flex min-h-24 flex-col gap-3 rounded-xl transition-colors ${
                isDropTarget ? 'bg-primary/5' : ''
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setDropTarget(column.id);
              }}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node)) return;
                setDropTarget((current) => (current === column.id ? null : current));
              }}
              onDrop={(event) => {
                event.preventDefault();
                void handleDrop(column.id);
              }}
            >
              {columnItems.map((item) => (
                <ActionCard
                  key={item.id}
                  item={item}
                  draggable
                  isDragging={draggingId === item.id}
                  isMoving={movingId === item.id}
                  onClick={() => {
                    if (draggedRef.current) return;
                    onItemClick(item);
                  }}
                  onDragStart={(event) => handleDragStart(item.id, event)}
                  onDragEnd={handleDragEnd}
                />
              ))}
              {!loading && columnItems.length === 0 && (
                <div className="text-sm text-text-muted">
                  {isDropTarget ? '여기에 놓으면 상태가 변경됩니다' : '항목이 없습니다'}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
