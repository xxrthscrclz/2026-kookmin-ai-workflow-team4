import type { FormEvent } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import FileDropZone from '@/components/ui/FileDropZone';
import DatePicker from '@/components/ui/DatePicker';

function previewText(text: string, maxLength = 160) {
  const trimmed = text.trim();
  if (!trimmed) return '(내용 없음)';
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

interface MeetingInputCollapsibleProps {
  title: string;
  date: string | null;
  attendees: string;
  rawText: string;
  uploadedFileName: string | null;
  loading: boolean;
  hasResult: boolean;
  expanded: boolean;
  onToggle: () => void;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string | null) => void;
  onAttendeesChange: (value: string) => void;
  onRawTextChange: (value: string) => void;
  onFileExtracted: (text: string, fileName: string) => void;
  onFileError: (message: string) => void;
  onSubmit: (event: FormEvent) => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
      <div className="shrink-0 text-xs font-medium text-text-muted sm:w-20">{label}</div>
      <div className="text-sm text-text-secondary">{value}</div>
    </div>
  );
}

export default function MeetingInputCollapsible({
  title,
  date,
  attendees,
  rawText,
  uploadedFileName,
  loading,
  hasResult,
  expanded,
  onToggle,
  onTitleChange,
  onDateChange,
  onAttendeesChange,
  onRawTextChange,
  onFileExtracted,
  onFileError,
  onSubmit,
}: MeetingInputCollapsibleProps) {
  const showCollapsed = hasResult && !expanded;

  const headerAction = hasResult ? (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 rounded-lg border border-glass-border bg-glass-bg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
      aria-expanded={expanded}
      aria-controls="meeting-input-panel"
    >
      <div
        className={`text-xs transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        aria-hidden
      >
        ▼
      </div>
      {expanded ? '접기' : '펼쳐서 보기·수정'}
    </button>
  ) : null;

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-lg font-semibold text-text-primary">회의 정보 입력</div>
          <div className="text-sm text-text-secondary">
            {hasResult
              ? expanded
                ? '입력 내용을 확인·수정한 뒤 다시 생성할 수 있습니다.'
                : '입력한 회의 정보가 접혀 있습니다. 펼쳐서 확인하거나 수정하세요.'
              : '회의 제목·날짜·참석자·본문을 입력하세요.'}
          </div>
        </div>
        {headerAction}
      </div>

      {showCollapsed && (
        <div className="flex flex-col gap-4 rounded-xl border border-glass-border bg-bg-surface p-4">
          <SummaryRow label="제목" value={title.trim() || '(미입력)'} />
          <SummaryRow label="날짜" value={date ?? '(미입력)'} />
          <SummaryRow
            label="참석자"
            value={attendees.trim() || '(미입력)'}
          />
          {uploadedFileName && (
            <SummaryRow label="파일" value={uploadedFileName} />
          )}
          <div className="flex flex-col gap-1">
            <div className="text-xs font-medium text-text-muted">회의 내용</div>
            <div className="rounded-lg border border-glass-border bg-glass-bg px-3 py-2 text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
              {previewText(rawText, 280)}
            </div>
          </div>
          <Button type="button" variant="secondary" size="sm" className="self-start" onClick={onToggle}>
            펼쳐서 보기·수정
          </Button>
        </div>
      )}

      {(!hasResult || expanded) && (
        <form
          id="meeting-input-panel"
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
        >
          <Input
            label="회의 제목 (선택)"
            placeholder="예: 스프린트 회고"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
          <DatePicker
            label="회의 날짜 (선택)"
            id="meeting-date"
            value={date}
            onChange={onDateChange}
            clearable
          />
          <Input
            label="참석자 (쉼표로 구분, 선택)"
            placeholder="예: 김OO, 이OO"
            value={attendees}
            onChange={(e) => onAttendeesChange(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <div className="text-sm font-medium text-text-secondary">자료 업로드</div>
            <FileDropZone onTextExtracted={onFileExtracted} onError={onFileError} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="raw-text" className="text-sm font-medium text-text-secondary">
              회의 내용
              {uploadedFileName && (
                <div className="mt-0.5 text-xs font-normal text-primary">
                  {uploadedFileName}에서 불러옴
                </div>
              )}
            </label>
            <textarea
              id="raw-text"
              className="min-h-48 w-full resize-y rounded-lg border border-glass-border bg-glass-bg px-3 py-2 text-sm text-text-primary backdrop-blur-sm placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-primary/20"
              placeholder="회의 내용을 붙여넣거나 위에서 파일을 업로드하세요..."
              value={rawText}
              onChange={(e) => onRawTextChange(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="lg" loading={loading}>
              {loading ? '생성 중...' : hasResult ? '회의록 다시 생성' : '회의록 생성'}
            </Button>
            {hasResult && expanded && (
              <Button type="button" variant="secondary" size="lg" onClick={onToggle}>
                접기
              </Button>
            )}
          </div>
        </form>
      )}
    </Card>
  );
}
