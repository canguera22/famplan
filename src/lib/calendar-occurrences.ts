import type { FamilyEvent } from "@/domain/family";

export interface CalendarOccurrence extends FamilyEvent {
  occurrenceKey: string;
  sourceEventId: string;
}

type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

function frequencyFor(rule: string | null): RecurrenceFrequency | null {
  const frequency = rule?.match(/(?:^|;)FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)(?:;|$)/)?.[1];
  return (frequency as RecurrenceFrequency | undefined) ?? null;
}

function nextOccurrence(date: Date, frequency: RecurrenceFrequency, original: Date): Date {
  const next = new Date(date);
  if (frequency === "DAILY") next.setDate(next.getDate() + 1);
  if (frequency === "WEEKLY") next.setDate(next.getDate() + 7);
  if (frequency === "MONTHLY") {
    const day = original.getDate();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, lastDay));
  }
  if (frequency === "YEARLY") {
    const month = original.getMonth();
    const day = original.getDate();
    next.setDate(1);
    next.setFullYear(next.getFullYear() + 1);
    next.setMonth(month);
    const lastDay = new Date(next.getFullYear(), month + 1, 0).getDate();
    next.setDate(Math.min(day, lastDay));
  }
  return next;
}

export function expandCalendarEvents(
  events: FamilyEvent[],
  rangeStart: Date,
  rangeEndExclusive: Date,
): CalendarOccurrence[] {
  const startMs = rangeStart.getTime();
  const endMs = rangeEndExclusive.getTime();
  const occurrences: CalendarOccurrence[] = [];

  for (const event of events) {
    const originalStart = new Date(event.startsAt);
    const duration = Math.max(1, new Date(event.endsAt).getTime() - originalStart.getTime());
    const frequency = frequencyFor(event.recurrenceRule);
    let occurrenceStart = originalStart;
    let guard = 0;

    while (guard < 10_000) {
      const occurrenceEndMs = occurrenceStart.getTime() + duration;
      if (occurrenceStart.getTime() < endMs && occurrenceEndMs > startMs) {
        const startsAt = occurrenceStart.toISOString();
        occurrences.push({
          ...event,
          startsAt,
          endsAt: new Date(occurrenceEndMs).toISOString(),
          occurrenceKey: `${event.id}:${startsAt}`,
          sourceEventId: event.id,
        });
      }
      if (!frequency || occurrenceStart.getTime() >= endMs) break;
      occurrenceStart = nextOccurrence(occurrenceStart, frequency, originalStart);
      guard += 1;
    }
  }

  return occurrences.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function eventOverlapsDay(event: Pick<FamilyEvent, "startsAt" | "endsAt">, day: Date) {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return new Date(event.startsAt) < end && new Date(event.endsAt) > start;
}

export function recurrenceLabel(rule: string | null): string | null {
  const frequency = frequencyFor(rule);
  if (frequency === "DAILY") return "Every day";
  if (frequency === "WEEKLY") return "Every week";
  if (frequency === "MONTHLY") return "Every month";
  if (frequency === "YEARLY") return "Every year";
  return null;
}

export function eventDisplayEnd(event: Pick<FamilyEvent, "endsAt" | "allDay">): Date {
  const end = new Date(event.endsAt);
  return event.allDay ? new Date(end.getTime() - 1) : end;
}

export function eventSpansMultipleDays(event: Pick<FamilyEvent, "startsAt" | "endsAt" | "allDay">) {
  const start = new Date(event.startsAt);
  const end = eventDisplayEnd(event);
  return (
    start.getFullYear() !== end.getFullYear() ||
    start.getMonth() !== end.getMonth() ||
    start.getDate() !== end.getDate()
  );
}
