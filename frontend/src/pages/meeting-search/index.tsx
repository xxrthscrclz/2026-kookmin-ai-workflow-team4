import { useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { searchMeetings } from '@/api/command';
import { USE_MOCK } from '@/api/config';
import { ApiRequestError } from '@/api/errors';
import type { MeetingListItem } from '@/api/types';
import { isoToDateKey } from '@/utils/actionApiMapper';

const MOCK_RESULTS = [
  {
    id: '1',
    title: '킥오프 미팅',
    date: '2026-06-28',
    snippet: '프로젝트 범위와 역할 분담을 확정했습니다. FE는 화면 3페이지...',
  },
  {
    id: '2',
    title: '기술 검토',
    date: '2026-06-29',
    snippet: 'LLM 어댑터 패턴과 mock 모드 동작 방식을 논의했습니다...',
  },
];

function meetingSnippet(meeting: MeetingListItem): string {
  if (meeting.minutes?.discussion) return meeting.minutes.discussion;
  if (meeting.minutes?.agenda?.length) return meeting.minutes.agenda.join(' · ');
  return meeting.title;
}

export default function MeetingSearchPage() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MeetingListItem[]>([]);
  const [total, setTotal] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setError(null);

    const trimmed = query.trim();
    if (!trimmed) {
      setError('검색어를 입력해 주세요.');
      setResults([]);
      setTotal(0);
      return;
    }

    if (USE_MOCK) {
      setResults([]);
      setTotal(MOCK_RESULTS.length);
      return;
    }

    setLoading(true);
    try {
      const response = await searchMeetings({ q: trimmed });
      setResults(response.meetings);
      setTotal(response.total);
    } catch (err) {
      setResults([]);
      setTotal(0);
      setError(err instanceof ApiRequestError ? err.message : '검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-bold text-text-primary">회의 검색</div>
        <div className="text-sm text-text-secondary">키워드로 과거 회의록을 검색합니다.</div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="검색어를 입력하세요 (예: API, LLM, 액션)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="self-end" disabled={loading}>
            {loading ? '검색 중...' : '검색'}
          </Button>
        </form>
      </Card>

      {searched && (
        <>
          {USE_MOCK && (
            <Alert variant="info">
              목업 모드(VITE_USE_MOCK=true)입니다. 실제 검색은 VITE_USE_MOCK=false로 설정하세요.
            </Alert>
          )}

          {error && (
            <Alert variant="error" title="오류">
              {error}
            </Alert>
          )}

          {!USE_MOCK && !loading && !error && (
            <div className="text-sm text-text-muted">검색 결과 {total}건</div>
          )}

          <div className="flex flex-col gap-3">
            {USE_MOCK
              ? MOCK_RESULTS.map((result) => (
                  <Card key={result.id}>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="text-base font-semibold text-text-primary">
                          {result.title}
                        </div>
                        <div className="text-xs text-text-muted">{result.date}</div>
                      </div>
                      <div className="text-sm text-text-secondary">{result.snippet}</div>
                    </div>
                  </Card>
                ))
              : results.map((result) => (
                  <Card key={result.id}>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="text-base font-semibold text-text-primary">
                          {result.title}
                        </div>
                        <div className="text-xs text-text-muted">{isoToDateKey(result.date)}</div>
                      </div>
                      <div className="text-sm text-text-secondary">{meetingSnippet(result)}</div>
                    </div>
                  </Card>
                ))}

            {!USE_MOCK && !loading && !error && results.length === 0 && (
              <div className="text-sm text-text-muted">검색 결과가 없습니다.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
