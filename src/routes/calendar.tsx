import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarCheck2,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListTodo,
  Repeat2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button, Card } from "@/components/ui-kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FamilyPerson } from "@/domain/family";
import { useAuth } from "@/lib/auth";
import {
  eventDisplayEnd,
  eventOverlapsDay,
  eventSpansMultipleDays,
  expandCalendarEvents,
  recurrenceLabel,
} from "@/lib/calendar-occurrences";
import { personFor, useFamilyPlanner } from "@/lib/family-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Mesa Family Planner" }] }),
  component: CalendarPage,
});

interface CalendarDisplayItem {
  id: string;
  title: string;
  description: string;
  at: string;
  endsAt: string | null;
  allDay: boolean;
  assigneeId: string | null;
  recurrenceRule: string | null;
  kind: "event" | "task";
  done: boolean;
}

function startOfWeek(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  next.setDate(next.getDate() - (day === 0 ? 6 : day - 1));
  return next;
}

function startOfMonth(date: Date): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function sameMonth(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function calendarDayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

function dayKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isMultiDayEvent(
  item: CalendarDisplayItem,
): item is CalendarDisplayItem & { kind: "event"; endsAt: string } {
  if (item.kind !== "event" || item.endsAt === null) return false;
  return eventSpansMultipleDays(item);
}

interface MonthBar {
  item: CalendarDisplayItem & { kind: "event"; endsAt: string };
  startColumn: number;
  span: number;
  lane: number;
}

function barsForWeek(items: CalendarDisplayItem[], weekStart: Date): MonthBar[] {
  const weekStartNumber = calendarDayNumber(weekStart);
  const candidates = items
    .filter(isMultiDayEvent)
    .map((item) => {
      const eventStart = new Date(item.at);
      const eventEnd = eventDisplayEnd(item);
      const startColumn = Math.max(0, calendarDayNumber(eventStart) - weekStartNumber);
      const endColumn = Math.min(6, calendarDayNumber(eventEnd) - weekStartNumber);
      return { item, startColumn, endColumn };
    })
    .filter((segment) => segment.endColumn >= 0 && segment.startColumn <= 6)
    .sort(
      (left, right) => left.startColumn - right.startColumn || right.endColumn - left.endColumn,
    );
  const laneEnds: number[] = [];

  return candidates.map(({ item, startColumn, endColumn }) => {
    let lane = laneEnds.findIndex((lastColumn) => lastColumn < startColumn);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = endColumn;
    return { item, startColumn, span: endColumn - startColumn + 1, lane };
  });
}

function CalendarPage() {
  const planner = useFamilyPlanner();
  const { user } = useAuth();
  const [anchor, setAnchor] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedItem, setSelectedItem] = useState<CalendarDisplayItem | null>(null);
  const currentPerson = planner.people.find((person) => person.userId === user?.id);
  const days = useMemo(() => {
    const gridStart = startOfWeek(anchor);
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [anchor]);
  const weeks = useMemo(
    () => Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7)),
    [days],
  );
  const monthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
    anchor,
  );
  const today = dayKey(new Date());

  const items = useMemo<CalendarDisplayItem[]>(() => {
    const rangeEnd = addDays(days[41], 1);
    return [
      ...expandCalendarEvents(planner.events, days[0], rangeEnd).map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        at: event.startsAt,
        endsAt: event.endsAt,
        allDay: event.allDay,
        assigneeId: event.assigneeId,
        recurrenceRule: event.recurrenceRule,
        kind: "event" as const,
        done: false,
      })),
      ...planner.tasks
        .filter((task) => task.showOnCalendar && task.dueAt)
        .map((task) => ({
          id: task.id,
          title: task.title,
          description: task.notes,
          at: task.dueAt!,
          endsAt: null,
          allDay: task.allDay,
          assigneeId: task.assigneeId,
          recurrenceRule: null,
          kind: "task" as const,
          done: task.status === "done",
        })),
    ];
  }, [days, planner.events, planner.tasks]);

  const itemsForDay = (date: Date) =>
    items
      .filter((item) =>
        item.kind === "event" ? eventOverlapsDay(item, date) : dayKey(item.at) === dayKey(date),
      )
      .sort((a, b) => a.at.localeCompare(b.at));

  const selectedItems = itemsForDay(selectedDate);
  const shiftMonth = (amount: number) => {
    const next = new Date(anchor.getFullYear(), anchor.getMonth() + amount, 1);
    setAnchor(next);
    setSelectedDate(next);
  };
  const goToToday = () => {
    const now = new Date();
    setAnchor(startOfMonth(now));
    setSelectedDate(now);
  };
  const selectedDateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(selectedDate);

  return (
    <AppShell
      title="Calendar"
      subtitle="One shared view of appointments, activities and dated tasks."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xl font-bold">{monthLabel}</p>
          <p className="text-xs text-muted-foreground">Select a day to see its plan</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="icon-button"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="icon-button"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2"
        aria-label="Family color key"
      >
        {planner.people.map((person) => (
          <span
            key={person.id}
            className="inline-flex min-h-8 items-center gap-2 text-xs font-bold"
          >
            <span
              className={cn(
                "h-3 w-3 rounded-full ring-2 ring-background",
                personTone(person.color).dot,
              )}
              aria-hidden="true"
            />
            {person.name}
            {person.id === currentPerson?.id ? (
              <span className="font-semibold text-primary">You</span>
            ) : null}
          </span>
        ))}
        <span className="inline-flex min-h-8 items-center gap-2 text-xs font-bold text-muted-foreground">
          <span className="h-3 w-3 rounded-full bg-muted-foreground/50 ring-2 ring-background" />
          Family / unassigned
        </span>
      </div>

      <MonthCalendar
        anchor={anchor}
        weeks={weeks}
        items={items}
        selectedDate={selectedDate}
        todayKey={today}
        people={planner.people}
        onSelectDate={setSelectedDate}
        onSelectItem={setSelectedItem}
      />

      <section className="mt-6" aria-labelledby="selected-day-heading">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="selected-day-heading" className="text-lg font-bold">
            {selectedDateLabel}
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {selectedItems.length} {selectedItems.length === 1 ? "item" : "items"}
          </span>
        </div>
        <Card className="overflow-hidden p-0">
          {selectedItems.length ? (
            <div className="divide-y divide-border">
              {selectedItems.map((item) => (
                <CalendarItem
                  key={`${item.kind}_${item.id}_${item.at}`}
                  item={item}
                  person={personFor(planner.people, item.assigneeId)}
                  isMine={item.assigneeId === currentPerson?.id}
                  onSelect={() => setSelectedItem(item)}
                />
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nothing planned for this day.
            </p>
          )}
        </Card>
      </section>

      {selectedItem ? (
        <CalendarItemDetail
          item={selectedItem}
          person={personFor(planner.people, selectedItem.assigneeId)}
          isMine={selectedItem.assigneeId === currentPerson?.id}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </AppShell>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MonthCalendar({
  anchor,
  weeks,
  items,
  selectedDate,
  todayKey,
  people,
  onSelectDate,
  onSelectItem,
}: {
  anchor: Date;
  weeks: Date[][];
  items: CalendarDisplayItem[];
  selectedDate: Date;
  todayKey: string;
  people: FamilyPerson[];
  onSelectDate: (date: Date) => void;
  onSelectItem: (item: CalendarDisplayItem) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl">
      <div className="grid grid-cols-7 border-b border-border bg-muted/65">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="py-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground sm:py-3 sm:text-xs"
          >
            {weekday}
          </div>
        ))}
      </div>
      {weeks.map((week) => {
        const bars = barsForWeek(items, week[0]!);
        return (
          <div
            key={dayKey(week[0]!)}
            className="relative grid grid-cols-7 border-b border-border last:border-b-0"
          >
            {week.map((date) => {
              const dateItems = items.filter((item) =>
                item.kind === "event"
                  ? eventOverlapsDay(item, date)
                  : dayKey(item.at) === dayKey(date),
              );
              const selected = dayKey(date) === dayKey(selectedDate);
              const isToday = dayKey(date) === todayKey;
              return (
                <button
                  key={dayKey(date)}
                  type="button"
                  onClick={() => onSelectDate(date)}
                  aria-pressed={selected}
                  aria-label={`${new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(date)}, ${dateItems.length} planned`}
                  className={cn(
                    "flex min-h-[6.75rem] min-w-0 flex-col border-r border-border p-1.5 text-left transition-colors last:border-r-0 hover:bg-muted/60 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring/20 sm:min-h-[8rem] sm:p-2",
                    !sameMonth(date, anchor) && "bg-muted/25 text-muted-foreground",
                    selected && "bg-person-blue/70",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full text-xs font-bold tabular-nums sm:h-8 sm:w-8 sm:text-sm",
                      isToday && "bg-primary text-primary-foreground",
                      selected && !isToday && "ring-2 ring-primary text-primary",
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <span className="mt-auto flex min-h-2 flex-wrap gap-1" aria-hidden="true">
                    {dateItems.slice(0, 4).map((item) => (
                      <span
                        key={`${item.kind}_${item.id}_${item.at}`}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          item.kind === "task"
                            ? "bg-secondary-foreground"
                            : personTone(personFor(people, item.assigneeId)?.color).dot,
                        )}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
            <div
              className="pointer-events-none absolute inset-x-0 top-9 grid grid-cols-7 gap-y-1 sm:top-11"
              aria-label="Multi-day events"
            >
              {bars.filter((bar) => bar.lane < 3).map((bar) => {
                const person = personFor(people, bar.item.assigneeId);
                return (
                  <button
                    key={`${bar.item.id}_${bar.item.at}_${bar.startColumn}`}
                    type="button"
                    onClick={() => onSelectItem(bar.item)}
                    className={cn(
                      "pointer-events-auto mx-0.5 h-4 min-w-0 cursor-pointer truncate rounded px-1 text-left text-[0.55rem] font-bold leading-4 ring-1 ring-inset ring-current/10 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-5 sm:px-2 sm:text-[0.65rem] sm:leading-5",
                      personTone(person?.color).soft,
                    )}
                    style={{
                      gridColumn: `${bar.startColumn + 1} / span ${bar.span}`,
                      gridRow: bar.lane + 1,
                    }}
                    aria-label={`Open multi-day event ${bar.item.title}`}
                  >
                    {bar.item.title}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const PERSON_TONES = {
  blue: { dot: "bg-primary", border: "border-l-primary", soft: "bg-person-blue text-primary" },
  green: {
    dot: "bg-secondary-foreground",
    border: "border-l-secondary-foreground",
    soft: "bg-person-green text-secondary-foreground",
  },
  amber: {
    dot: "bg-accent",
    border: "border-l-accent",
    soft: "bg-person-amber text-accent-foreground",
  },
  violet: {
    dot: "bg-violet-600",
    border: "border-l-violet-600",
    soft: "bg-person-violet text-violet-700",
  },
} as const;

function personTone(color?: FamilyPerson["color"]) {
  return color
    ? PERSON_TONES[color]
    : {
        dot: "bg-muted-foreground/50",
        border: "border-l-muted-foreground/40",
        soft: "bg-muted text-muted-foreground",
      };
}

function CalendarItem({
  item,
  person,
  isMine,
  onSelect,
  compact = false,
}: {
  item: CalendarDisplayItem;
  person: FamilyPerson | undefined;
  isMine: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const tone = personTone(person?.color);
  const time = item.allDay
    ? "All day"
    : new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(
        new Date(item.at),
      );
  const spansDays = item.kind === "event" && eventSpansMultipleDays(item);
  const repeats = recurrenceLabel(item.recurrenceRule);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative w-full cursor-pointer text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
        compact
          ? "rounded-xl border border-border border-l-4 p-2.5"
          : "flex min-h-14 gap-3 border-l-4 px-4 py-4",
        tone.border,
        item.done && "opacity-55",
      )}
    >
      {!compact ? (
        <span
          className={cn(
            "mt-1 h-10 w-1 shrink-0 rounded-full",
            item.kind === "task" ? "bg-secondary-foreground" : "bg-primary",
          )}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[0.68rem] font-bold text-muted-foreground">
          {item.kind === "task" ? (
            <ListTodo className="h-3.5 w-3.5" />
          ) : (
            <CalendarCheck2 className="h-3.5 w-3.5" />
          )}
          <span>{item.kind === "task" ? "TASK" : time}</span>
          {spansDays ? <CalendarRange className="ml-1 h-3.5 w-3.5" aria-label="Multi-day" /> : null}
          {repeats ? <Repeat2 className="h-3.5 w-3.5" aria-label={repeats} /> : null}
        </div>
        <p
          className={cn(
            "mt-1 font-semibold leading-snug",
            compact ? "text-xs" : "text-sm",
            item.done && "line-through",
          )}
        >
          {item.title}
        </p>
        {!compact ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            {time}
            {person ? ` · ${person.name}` : ""}
            {isMine ? (
              <span className="rounded-full bg-person-blue px-2 py-0.5 font-bold text-primary">
                Assigned to you
              </span>
            ) : person ? (
              <span className="font-semibold">Assigned to someone else</span>
            ) : null}
          </div>
        ) : (
          <span
            className={cn(
              "mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold",
              tone.soft,
            )}
          >
            {isMine ? "You" : (person?.shortName ?? "Family")}
          </span>
        )}
      </div>
      {person && !compact ? (
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.68rem] font-bold",
            tone.soft,
          )}
          title={person.name}
        >
          {person.shortName}
        </span>
      ) : null}
    </button>
  );
}

function CalendarItemDetail({
  item,
  person,
  isMine,
  onClose,
}: {
  item: CalendarDisplayItem;
  person: FamilyPerson | undefined;
  isMine: boolean;
  onClose: () => void;
}) {
  const date = new Date(item.at);
  const tone = personTone(person?.color);
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const endDate = item.kind === "event" ? eventDisplayEnd(item) : date;
  const spansDays = item.kind === "event" && eventSpansMultipleDays(item);
  const endDateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(endDate);
  const repeats = recurrenceLabel(item.recurrenceRule);
  const timeLabel = item.allDay
    ? "All day"
    : new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] rounded-3xl p-5 sm:max-w-lg sm:p-6">
        <DialogHeader className="pr-8 text-left">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {item.kind === "task" ? (
              <ListTodo className="h-4 w-4" />
            ) : (
              <CalendarCheck2 className="h-4 w-4" />
            )}
            {item.kind}
          </div>
          <DialogTitle className="pt-2 text-2xl leading-tight">{item.title}</DialogTitle>
          <DialogDescription>
            {spansDays ? `${dateLabel} – ${endDateLabel}` : dateLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-2xl bg-muted p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">When</p>
              <p className="mt-1 text-sm font-bold">{timeLabel}</p>
            </div>
            {repeats ? (
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Repeats</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold">
                  <Repeat2 className="h-4 w-4" /> {repeats}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Assigned to</p>
              <span
                className={cn(
                  "mt-1 inline-flex min-h-8 items-center gap-2 rounded-full px-2.5 text-xs font-bold",
                  tone.soft,
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", tone.dot)} />
                {person ? `${person.name}${isMine ? " · You" : ""}` : "Family / unassigned"}
              </span>
            </div>
          </div>

          {item.description ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Details</p>
              <p className="mt-1 text-sm leading-6">{item.description}</p>
            </div>
          ) : null}

          {item.kind === "task" ? (
            <Link to="/lists" onClick={onClose}>
              <Button className="w-full">Open in lists</Button>
            </Link>
          ) : (
            <Button variant="secondary" className="w-full" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
