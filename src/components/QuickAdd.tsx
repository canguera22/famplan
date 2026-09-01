import { useMemo, useState } from "react";
import { CalendarPlus, CheckSquare2, Plus } from "lucide-react";
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

export function QuickAdd({ compact = false }: { compact?: boolean }) {
  const planner = useFamilyPlanner();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AddMode>("task");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [listId, setListId] = useState(planner.lists[0]?.id ?? "family_tasks");
  const [assigneeId, setAssigneeId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("17:00");
  const [endTime, setEndTime] = useState("18:00");
  const [showOnCalendar, setShowOnCalendar] = useState(true);

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    return mode === "task" || Boolean(date && time && endTime);
  }, [date, endTime, mode, time, title]);

  const reset = () => {
    setTitle("");
    setNotes("");
    setAssigneeId("");
    setDate("");
    setTime("17:00");
    setEndTime("18:00");
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
        startsAt: localIso(date, time),
        endsAt: localIso(date, endTime),
        assigneeId: assigneeId || null,
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

          <div className={cn("grid gap-4", mode === "event" && "sm:grid-cols-3")}>
            <Field
              label={mode === "task" ? "Due date" : "Date"}
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
                <Field label="Starts">
                  <TextInput
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                  />
                </Field>
                <Field label="Ends">
                  <TextInput
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                  />
                </Field>
              </>
            ) : null}
          </div>

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
