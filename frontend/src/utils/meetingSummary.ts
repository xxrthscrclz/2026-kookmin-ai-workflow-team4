import type { MeetingListItem } from '@/api/types';

/** 목록 카드용 한 줄 요약. discussion → decisions → agenda → 제목 순으로 사용한다. */
export function meetingListSnippet(meeting: MeetingListItem, maxLength = 140): string {
  const { minutes } = meeting;

  if (minutes?.discussion?.trim()) {
    return truncate(minutes.discussion.trim(), maxLength);
  }

  if (minutes?.decisions?.length) {
    return truncate(minutes.decisions.join(' · '), maxLength);
  }

  if (minutes?.agenda?.length) {
    return truncate(minutes.agenda.join(' · '), maxLength);
  }

  return meeting.title;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}
