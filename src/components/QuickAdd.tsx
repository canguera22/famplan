import { useMemo, useState } from "react";
import { CalendarPlus, CheckSquare2, Plus, Repeat2 } from "lucide-react";
import { Button, Field, TextArea, TextInput, Toggle } from "@/components/ui-kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFamilyPlanner } from "@/lib/family-store";
import { cn } from "@/lib/utils";

type AddMode = "task" | "event";

function localDate(offset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function localIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

function inferredEventEnd(date: string, endDate: string, time: string, allDay: boolean): string {
  const finalDate = endDate || date;
  if (allDay) {
    const end = new Date(`${finalDate}T00:00:00`);
    end.setDate(end.getDate() + 1);
    return end.toISOString();
  }
  const end = new Date(`${finalDate}T${time}:00`);
  end.setHours(end.getHours() + 1);
  return end.toISOString();
}

export function QuickAdd({ compact = false }: { compact?: boolean }) {
  const planner = useFamilyPlanner();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AddMode>("task");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [listId, setListId] = useState(planner.lists[0]?.id ?? "family_tasks");
  const [assigneeId, setAssigneeId] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [time, setTime] = useState("17:00");
  const [allDay, setAllDay] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [showOnCalendar, setShowOnCalendar] = useState(true);

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    return mode === "task" || Boolean(date && (allDay || time) && (!endDate || endDate >= date));
  }, [allDay, date, endDate, mode, time, title]);

  const reset = () => {
    setTitle("");
    setNotes("");
    setAssigneeId("");
    setDate("");
    setEndDate("");
    setTime("17:00");
    setAllDay(false);
    setRecurrenceRule("");
    setShowOnCalendar(true);
  };

  const submit = () => {
    if (!canSubmit) return;
    if (mode === "task") {
      planner.addTask({
        title: title.trim(),
        notes: notes.trim(),
        listId,
        assigneeId: assigneeId || null,
        dueAt: date ? localIso(date, "12:00") : null,
        allDay: true,
        showOnCalendar: date ? showOnCalendar : false,
      });
    } else {
      planner.addEvent({
        title: title.trim(),
        description: notes.trim(),
        startsAt: localIso(date, allDay ? "00:00" : time),
        endsAt: inferredEventEnd(date, endDate, time, allDay),
        allDay,
        assigneeId: assigneeId || null,
        recurrenceRule: recurrenceRule || null,
      });
    }
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "min-h-11 shadow-sm",
            compact && "h-14 w-14 rounded-full p-0 shadow-lg [&_span]:sr-only",
          )}
          aria-label="Quick add"
        >
          <Plus className={compact ? "h-6 w-6" : "h-4 w-4"} />
          <span>Quick add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-3xl border-border p-5 sm:max-w-lg sm:p-6">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle>Add to the family plan</DialogTitle>
          <DialogDescription>
            Create a task or put something directly on the calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 rounded-2xl bg-muted p-1" role="tablist">
          {(["task", "event"] as AddMode[]).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => {
                setMode(value);
                if (value === "event" && !date) setDate(localDate());
              }}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
                mode === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {value === "task" ? (
                <CheckSquare2 className="h-4 w-4" />
              ) : (
                <CalendarPlus className="h-4 w-4" />
              )}
              {value === "task" ? "Task" : "Event"}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          <Field label={mode === "task" ? "What needs doing?" : "Event name"}>
            <TextInput
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={mode === "task" ? "e.g. Return school form" : "e.g. Swimming lesson"}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            {mode === "task" ? (
              <Field label="List">
                <select
                  value={listId}
                  onChange={(event) => setListId(event.target.value)}
                  className="form-control"
                >
                  {planner.lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
            <Field label="Assign to" hint="Optional">
              <select
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
                className="form-control"
              >
                <option value="">No one yet</option>
                {planner.people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className={cn("grid gap-4", mode === "event" && "sm:grid-cols-2")}>
            <Field
              label={mode === "task" ? "Due date" : "Starts on"}
              hint={mode === "task" ? "Optional" : "Required"}
            >
              <TextInput
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
            {mode === "event" ? (
              <>
                <Field label="Ends on" hint="Optional · inclusive">
                  <TextInput
                    type="date"
                    min={date || undefined}
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </Field>
              </>
            ) : null}
          </div>

          {mode === "event" ? (
            <div className="grid gap-4 rounded-2xl border border-border p-4">
              <label className="flex min-h-11 items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-semibold">All day</span>
                  <span className="block text-xs text-muted-foreground">
                    Useful for travel, holidays and multi-day plans
                  </span>
                </span>
                <Toggle checked={allDay} onChange={setAllDay} />
              </label>
              {!allDay ? (
                <Field label="Start time">
                  <TextInput
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                  />
                </Field>
              ) : null}
              <Field label="Repeats">
                <div className="relative">
                  <Repeat2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={recurrenceRule}
                    onChange={(event) => setRecurrenceRule(event.target.value)}
                    className="form-control pl-10"
                  >
                    <option value="">Does not repeat</option>
                    <option value="FREQ=DAILY">Every day</option>
                    <option value="FREQ=WEEKLY">Every week</option>
                    <option value="FREQ=MONTHLY">Every month</option>
                    <option value="FREQ=YEARLY">Every year</option>
                  </select>
                </div>
              </Field>
            </div>
          ) : null}

          {mode === "task" && date ? (
            <label className="flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3">
              <span>
                <span className="block text-sm font-semibold">Show on calendar</span>
                <span className="block text-xs text-muted-foreground">
                  On by default for dated tasks
                </span>
              </span>
              <Toggle checked={showOnCalendar} onChange={setShowOnCalendar} />
            </label>
          ) : null}

          <Field label="Notes" hint="Optional">
            <TextArea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any useful context"
            />
          </Field>
        </div>

        <Button size="lg" disabled={!canSubmit} onClick={submit}>
          <Plus className="h-4 w-4" /> Add {mode}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
