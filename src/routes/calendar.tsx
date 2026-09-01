import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarCheck2, ChevronLeft, ChevronRight, Clock3, ListTodo } from "lucide-react";
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

function dayKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function CalendarPage() {
  const planner = useFamilyPlanner();
  const { user } = useAuth();
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const [selectedItem, setSelectedItem] = useState<CalendarDisplayItem | null>(null);
  const currentPerson = planner.people.find((person) => person.userId === user?.id);
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(anchor);
        date.setDate(anchor.getDate() + index);
        return date;
      }),
    [anchor],
  );
  const today = dayKey(new Date());

  const items = useMemo<CalendarDisplayItem[]>(
    () => [
      ...planner.events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        at: event.startsAt,
        endsAt: event.endsAt,
        allDay: event.allDay,
        assigneeId: event.assigneeId,
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
          kind: "task" as const,
          done: task.status === "done",
        })),
    ],
    [planner.events, planner.tasks],
  );

  const shiftWeek = (amount: number) =>
    setAnchor((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + amount * 7);
      return next;
    });
  const rangeLabel = `${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(days[0])} – ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(days[6])}`;

  return (
    <AppShell
      title="Calendar"
      subtitle="One shared view of appointments, activities and dated tasks."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold">{rangeLabel}</p>
          <p className="text-xs text-muted-foreground">Europe/Madrid</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setAnchor(startOfWeek(new Date()))}>
            Today
          </Button>
          <button
            type="button"
            onClick={() => shiftWeek(-1)}
            className="icon-button"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => shiftWeek(1)}
            className="icon-button"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2"
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

      <div className="hidden overflow-hidden rounded-3xl border border-border bg-card md:grid md:grid-cols-7">
        {days.map((date) => {
          const dateItems = items
            .filter((item) => dayKey(item.at) === dayKey(date))
            .sort((a, b) => a.at.localeCompare(b.at));
          const isToday = dayKey(date) === today;
          return (
            <section
              key={dayKey(date)}
              className="min-h-[31rem] border-r border-border last:border-r-0"
              aria-label={new Intl.DateTimeFormat("en", {
                weekday: "long",
                month: "long",
                day: "numeric",
              }).format(date)}
            >
              <div
                className={cn(
                  "border-b border-border px-3 py-4 text-center",
                  isToday && "bg-person-blue",
                )}
              >
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)}
                </p>
                <p
                  className={cn(
                    "mx-auto mt-1 grid h-9 w-9 place-items-center rounded-full text-lg font-bold",
                    isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {date.getDate()}
                </p>
              </div>
              <div className="space-y-2 p-2">
                {dateItems.map((item) => (
                  <CalendarItem
                    key={`${item.kind}_${item.id}`}
                    item={item}
                    person={personFor(planner.people, item.assigneeId)}
                    isMine={item.assigneeId === currentPerson?.id}
                    onSelect={() => setSelectedItem(item)}
                    compact
                  />
                ))}
                {!dateItems.length ? (
                  <p className="px-1 py-3 text-center text-xs text-muted-foreground">Clear</p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <div className="space-y-4 md:hidden">
        {days.map((date) => {
          const dateItems = items
            .filter((item) => dayKey(item.at) === dayKey(date))
            .sort((a, b) => a.at.localeCompare(b.at));
          const isToday = dayKey(date) === today;
          return (
            <section key={dayKey(date)} aria-labelledby={`day-${dayKey(date)}`}>
              <div className="mb-2 flex items-baseline gap-2">
                <h2
                  id={`day-${dayKey(date)}`}
                  className={cn("font-bold", isToday && "text-primary")}
                >
                  {new Intl.DateTimeFormat("en", { weekday: "long" }).format(date)}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)}
                </span>
                {isToday ? (
                  <span className="rounded-full bg-person-blue px-2 py-0.5 text-[0.68rem] font-bold text-primary">
                    Today
                  </span>
                ) : null}
              </div>
              <Card className="overflow-hidden p-0">
                {dateItems.length ? (
                  <div className="divide-y divide-border">
                    {dateItems.map((item) => (
                      <CalendarItem
                        key={`${item.kind}_${item.id}`}
                        item={item}
                        person={personFor(planner.people, item.assigneeId)}
                        isMine={item.assigneeId === currentPerson?.id}
                        onSelect={() => setSelectedItem(item)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-5 text-sm text-muted-foreground">Nothing planned.</p>
                )}
              </Card>
            </section>
          );
        })}
      </div>

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
          <DialogDescription>{dateLabel}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-2xl bg-muted p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">When</p>
              <p className="mt-1 text-sm font-bold">{timeLabel}</p>
            </div>
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
