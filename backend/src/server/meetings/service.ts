import { Prisma } from "@prisma/client";
import { generateMeetingArtifacts } from "../ai/llm.js";
import { prisma } from "../db.js";
import { ApiError } from "../http/errors.js";
import type { CreateMeetingInput, ListMeetingsQuery } from "./schemas.js";

const meetingWithActions = {
  include: { actionItems: { orderBy: { createdAt: "asc" } } },
} satisfies Prisma.MeetingDefaultArgs;

/** POST /api/meetings — 전사본 → LLM 생성 → 저장 → 생성된 회의 반환. */
export async function createMeeting(input: CreateMeetingInput) {
  const artifacts = await generateMeetingArtifacts({
    rawText: input.rawText,
    title: input.title,
    attendees: input.attendees,
  });

  const title = input.title ?? artifacts.title;
  const attendees = input.attendees ?? artifacts.attendees;
  const date = input.date ? new Date(input.date) : new Date();

  return prisma.meeting.create({
    data: {
      title,
      date,
      attendees: attendees as unknown as Prisma.InputJsonValue,
      rawText: input.rawText,
      minutes: artifacts.minutes as unknown as Prisma.InputJsonValue,
      actionItems: {
        create: artifacts.actionItems.map((item) => ({
          content: item.content,
          assignee: item.assignee,
          dueDate: parseDate(item.dueDate),
          status: "todo",
        })),
      },
    },
    ...meetingWithActions,
  });
}

/** GET /api/meetings — 최신순 목록(가벼운 요약). rawText 제외, 액션아이템 개수만. */
export async function listMeetings(query: ListMeetingsQuery) {
  const { limit, offset } = query;
  const [rows, total] = await Promise.all([
    prisma.meeting.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        date: true,
        attendees: true,
        minutes: true,
        createdAt: true,
        _count: { select: { actionItems: true } },
      },
    }),
    prisma.meeting.count(),
  ]);

  const meetings = rows.map(({ _count, ...rest }) => ({
    ...rest,
    actionItemCount: _count.actionItems,
  }));

  return { meetings, total, limit, offset };
}

/** GET /api/meetings/:id — 단건 상세(actionItems 포함). 없으면 404. */
export async function getMeetingById(id: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    ...meetingWithActions,
  });
  if (!meeting) {
    throw new ApiError("NOT_FOUND", `id가 ${id}인 회의를 찾을 수 없습니다.`);
  }
  return meeting;
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
