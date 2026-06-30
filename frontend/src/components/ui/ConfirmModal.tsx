import { useEffect } from 'react';
import Button from '@/components/ui/Button';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = '삭제',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay z-60" onClick={onCancel} role="presentation">
      <div className="modal-overlay__blur" aria-hidden="true" />
      <div className="modal-overlay__vignette" aria-hidden="true" />
      <div
        className="modal-panel flex w-full max-w-sm flex-col gap-4 p-6"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <div id="confirm-modal-title" className="text-lg font-semibold text-text-primary">
            {title}
          </div>
          <div id="confirm-modal-message" className="text-sm text-text-secondary">
            {message}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" size="md" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="md"
            className="bg-error text-text-inverse hover:bg-error/90 border border-transparent"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
