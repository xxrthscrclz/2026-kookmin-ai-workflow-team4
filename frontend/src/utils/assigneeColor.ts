export interface AssigneeColorClasses {
  badgeBg: string;
  badgeText: string;
  calendarBar: string;
}

const PALETTE: AssigneeColorClasses[] = [
  {
    badgeBg: 'bg-primary-subtle',
    badgeText: 'text-primary',
    calendarBar: 'bg-primary/40',
  },
  {
    badgeBg: 'bg-success-bg',
    badgeText: 'text-success',
    calendarBar: 'bg-success/40',
  },
  {
    badgeBg: 'bg-warning-bg',
    badgeText: 'text-warning',
    calendarBar: 'bg-warning/40',
  },
  {
    badgeBg: 'bg-error-bg',
    badgeText: 'text-error',
    calendarBar: 'bg-error/35',
  },
  {
    badgeBg: 'bg-bg-accent',
    badgeText: 'text-text-link',
    calendarBar: 'bg-primary-muted/45',
  },
  {
    badgeBg: 'bg-bg-muted',
    badgeText: 'text-text-secondary',
    calendarBar: 'bg-border-strong/50',
  },
];

const UNASSIGNED_COLOR: AssigneeColorClasses = {
  badgeBg: 'bg-warning-bg',
  badgeText: 'text-warning',
  calendarBar: 'bg-warning/30',
};

function hashAssignee(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % PALETTE.length;
}

export function getAssigneeColor(assignee: string | null): AssigneeColorClasses {
  if (!assignee) return UNASSIGNED_COLOR;
  return PALETTE[hashAssignee(assignee)];
}

export function getUniqueAssignees(items: { assignee: string | null }[]): string[] {
  const names = new Set<string>();
  for (const item of items) {
    if (item.assignee) names.add(item.assignee);
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'ko'));
}
