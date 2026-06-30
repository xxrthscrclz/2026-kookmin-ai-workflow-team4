import { useRef, useState } from 'react';
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

  const isDragging = draggingId !== null;

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

  const handleColumnDragOver = (status: ActionBoardStatus, event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget(status);
  };

  const handleColumnDragLeave = (status: ActionBoardStatus, event: React.DragEvent) => {
    const related = event.relatedTarget;
    if (related instanceof Node && event.currentTarget.contains(related)) return;
    setDropTarget((current) => (current === status ? null : current));
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
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
      {ACTION_STATUS_COLUMNS.map((column) => {
        const columnItems = itemsByStatus[column.id];
        const isDropTarget = dropTarget === column.id;

        return (
          <div
            key={column.id}
            className={`glass flex min-h-56 flex-col rounded-2xl p-6 transition-colors ${
              isDropTarget ? 'bg-primary/5 ring-2 ring-primary/40' : ''
            }`}
            onDragOver={(event) => handleColumnDragOver(column.id, event)}
            onDragLeave={(event) => handleColumnDragLeave(column.id, event)}
            onDrop={(event) => {
              event.preventDefault();
              void handleDrop(column.id);
            }}
          >
            <div className="mb-4 shrink-0 text-lg font-semibold text-text-primary">
              {column.label} ({columnItems.length})
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3">
              {columnItems.map((item) => (
                <ActionCard
                  key={item.id}
                  item={item}
                  draggable
                  isDragging={draggingId === item.id}
                  isMoving={movingId === item.id}
                  className={isDragging && draggingId !== item.id ? 'pointer-events-none' : ''}
                  onClick={() => {
                    if (draggedRef.current) return;
                    onItemClick(item);
                  }}
                  onDragStart={(event) => handleDragStart(item.id, event)}
                  onDragEnd={handleDragEnd}
                />
              ))}

              <div
                className={`flex flex-1 flex-col justify-center rounded-xl border border-dashed border-transparent px-2 py-3 transition-colors ${
                  isDropTarget ? 'border-primary/30 bg-primary/5' : ''
                }`}
              >
                {!loading && columnItems.length === 0 && (
                  <div className="text-center text-sm text-text-muted">
                    {isDropTarget ? '여기에 놓으면 상태가 변경됩니다' : '항목이 없습니다'}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
