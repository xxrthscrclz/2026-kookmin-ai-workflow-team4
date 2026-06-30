import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ActionKanbanBoard from '@/components/action-tracker/ActionKanbanBoard';
import ActionCalendar from '@/components/action-tracker/ActionCalendar';
import ActionItemModal from '@/components/action-tracker/ActionItemModal';
import { USE_MOCK } from '@/api/config';
import { ACTION_STATUS_COLUMNS, type ActionBoardItem } from '@/constants/actionTracker';
import { useActionTrackerStore } from '@/stores/actionTrackerStore';

type ModalState =
  | { open: false }
  | { open: true; mode: 'add' }
  | { open: true; mode: 'edit'; item: ActionBoardItem };

export default function ActionTrackerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const items = useActionTrackerStore((state) => state.items);
  const loading = useActionTrackerStore((state) => state.loading);
  const error = useActionTrackerStore((state) => state.error);
  const fetchItems = useActionTrackerStore((state) => state.fetchItems);
  const addItem = useActionTrackerStore((state) => state.addItem);
  const updateItem = useActionTrackerStore((state) => state.updateItem);
  const removeItem = useActionTrackerStore((state) => state.removeItem);

  const [modal, setModal] = useState<ModalState>({ open: false });
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    const actionId = searchParams.get('actionId');
    if (!actionId || loading) return;

    const item = items.find((entry) => entry.id === actionId);
    if (!item) return;

    setModal({ open: true, mode: 'edit', item });
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('actionId');
    setSearchParams(nextParams, { replace: true });
  }, [items, loading, searchParams, setSearchParams]);

  const itemsByStatus = useMemo(
    () =>
      ACTION_STATUS_COLUMNS.reduce(
        (acc, column) => {
          acc[column.id] = items.filter((item) => item.status === column.id);
          return acc;
        },
        {} as Record<(typeof ACTION_STATUS_COLUMNS)[number]['id'], ActionBoardItem[]>,
      ),
    [items],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold text-text-primary">액션 아이템 트래커</div>
          <div className="text-sm text-text-secondary">
            카드를 드래그해 상태를 변경하거나, 클릭해 시작일·마감일·메모를 수정하세요.
          </div>
        </div>
        <Button type="button" onClick={() => setModal({ open: true, mode: 'add' })}>
          액션 추가
        </Button>
      </div>

      {USE_MOCK && (
        <Alert variant="info">
          목업 모드(VITE_USE_MOCK=true)입니다. 브라우저 메모리에만 저장됩니다.
        </Alert>
      )}

      {(error || saveError) && (
        <Alert variant="error" title="오류">
          {error ?? saveError}
        </Alert>
      )}

      {loading && <div className="text-sm text-text-muted">액션 목록을 불러오는 중...</div>}

      <ActionKanbanBoard
        itemsByStatus={itemsByStatus}
        loading={loading}
        onItemClick={(item) => setModal({ open: true, mode: 'edit', item })}
        onStatusChange={async (id, status) => {
          setSaveError(null);
          try {
            await updateItem(id, { status });
          } catch (err) {
            setSaveError(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
          }
        }}
      />

      <ActionCalendar
        items={items}
        onItemClick={(item) => setModal({ open: true, mode: 'edit', item })}
      />

      <ActionItemModal
        open={modal.open}
        mode={modal.open ? modal.mode : 'add'}
        item={modal.open && modal.mode === 'edit' ? modal.item : undefined}
        onClose={() => {
          setModal({ open: false });
          setSaveError(null);
        }}
        onSave={async (draft) => {
          setSaveError(null);
          try {
            if (modal.open && modal.mode === 'edit') {
              await updateItem(modal.item.id, draft);
              setModal({ open: false });
              return;
            }
            addItem(draft);
            setModal({ open: false });
          } catch (err) {
            setSaveError(err instanceof Error ? err.message : '저장에 실패했습니다.');
          }
        }}
        onDelete={
          modal.open && modal.mode === 'edit'
            ? (id) => removeItem(id)
            : undefined
        }
      />
    </div>
  );
}
