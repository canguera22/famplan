import { createFileRoute } from "@tanstack/react-router";
import { useState, type DragEvent } from "react";
import { CalendarDays, Check, ChevronDown, Circle, ListTodo, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button, Field, TextArea, TextInput, Toggle } from "@/components/ui-kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FamilyTask } from "@/domain/family";
import { personFor, useFamilyPlanner } from "@/lib/family-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lists")({
  head: () => ({ meta: [{ title: "Lists — Mesa Family Planner" }] }),
  component: ListsPage,
});

type BoardLane = "active" | "done";

const LANES: Array<{ status: BoardLane; label: string; helper: string }> = [
  { status: "active", label: "Open", helper: "Everything still to do" },
  { status: "done", label: "Done", helper: "Completed" },
];

function taskIsInLane(task: FamilyTask, lane: BoardLane) {
  return lane === "done" ? task.status === "done" : task.status !== "done";
}

function ListsPage() {
  const planner = useFamilyPlanner();
  const [listId, setListId] = useState(planner.lists[0]?.id ?? "family_tasks");
  const [mobileLane, setMobileLane] = useState<BoardLane>("active");
  const [editing, setEditing] = useState<FamilyTask | null>(null);
  const selected = planner.lists.find((list) => list.id === listId) ?? planner.lists[0]!;
  const tasks = planner.tasks.filter((task) => task.listId === selected.id);

  const drop = (event: DragEvent, status: BoardLane) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/mesa-task");
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task) return;
    planner.moveTask(taskId, status === "done" ? "done" : task.assigneeId ? "assigned" : "open");
  };

  return (
    <AppShell title="Lists" subtitle="Shared boards for everything the family needs to get done.">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <label
            htmlFor="list-picker"
            className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
          >
            Current board
          </label>
          <div className="relative mt-1.5 max-w-sm">
            <select
              id="list-picker"
              value={listId}
              onChange={(event) => setListId(event.target.value)}
              className="form-control appearance-none pr-10 font-bold"
            >
              {planner.lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{selected.description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary" /> Dated cards appear on the calendar by
          default
        </div>
      </div>

      <div
        className="mb-4 grid grid-cols-2 rounded-2xl bg-muted p-1 md:hidden"
        role="tablist"
        aria-label="Task lanes"
      >
        {LANES.map((lane) => {
          const count = tasks.filter((task) => taskIsInLane(task, lane.status)).length;
          return (
            <button
              key={lane.status}
              type="button"
              role="tab"
              aria-selected={mobileLane === lane.status}
              onClick={() => setMobileLane(lane.status)}
              className={cn(
                "min-h-12 rounded-xl px-2 text-sm font-bold transition-colors",
                mobileLane === lane.status
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {lane.label}
              <span className="ml-1 text-xs">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden grid-cols-2 gap-4 md:grid">
        {LANES.map((lane) => (
          <KanbanLane
            key={lane.status}
            lane={lane}
            tasks={tasks.filter((task) => taskIsInLane(task, lane.status))}
            onEdit={setEditing}
            onDrop={(event) => drop(event, lane.status)}
          />
        ))}
      </div>
      <div className="md:hidden">
        {LANES.filter((lane) => lane.status === mobileLane).map((lane) => (
          <KanbanLane
            key={lane.status}
            lane={lane}
            tasks={tasks.filter((task) => taskIsInLane(task, lane.status))}
            onEdit={setEditing}
            onDrop={(event) => drop(event, lane.status)}
            mobile
          />
        ))}
      </div>

      {editing ? (
        <TaskEditor key={editing.id} task={editing} onClose={() => setEditing(null)} />
      ) : null}
    </AppShell>
  );
}

function KanbanLane({
  lane,
  tasks,
  onEdit,
  onDrop,
  mobile = false,
}: {
  lane: (typeof LANES)[number];
  tasks: FamilyTask[];
  onEdit: (task: FamilyTask) => void;
  onDrop: (event: DragEvent) => void;
  mobile?: boolean;
}) {
  return (
    <section
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className={cn("rounded-3xl bg-muted/70 p-3", !mobile && "min-h-[32rem]")}
      aria-labelledby={`lane-${lane.status}`}
    >
      <div className="flex items-center justify-between gap-3 px-1 py-2">
        <div>
          <h2 id={`lane-${lane.status}`} className="flex items-center gap-2 text-sm font-bold">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                lane.status === "active" ? "bg-primary" : "bg-secondary-foreground",
              )}
            />
            {lane.label}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{lane.helper}</p>
        </div>
        <span className="grid h-8 min-w-8 place-items-center rounded-full bg-card px-2 text-xs font-bold">
          {tasks.length}
        </span>
      </div>
      <div className="mt-2 space-y-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onEdit={() => onEdit(task)} />
        ))}
        {!tasks.length ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
            <ListTodo className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-2 text-xs font-semibold text-muted-foreground">No cards here</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function KanbanCard({ task, onEdit }: { task: FamilyTask; onEdit: () => void }) {
  const planner = useFamilyPlanner();
  const person = personFor(planner.people, task.assigneeId);
  const due = task.dueAt
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(task.dueAt))
    : null;
  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/mesa-task", task.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "group rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_oklch(0.2_0.02_250/0.04)]",
        task.status === "done" && "opacity-70",
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 rounded-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <p className={cn("font-semibold leading-snug", task.status === "done" && "line-through")}>
            {task.title}
          </p>
          {task.priority === "high" ? (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[0.65rem] font-bold text-destructive">
              HIGH
            </span>
          ) : null}
        </div>
        {task.notes ? (
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{task.notes}</p>
        ) : null}
      </button>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {person ? (
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-muted px-2.5 text-xs font-bold">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-card text-[0.6rem]">
              {person.shortName}
            </span>
            {person.name}
          </span>
        ) : (
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-person-amber px-2.5 text-xs font-bold text-accent-foreground">
            <UserRound className="h-3.5 w-3.5" />
            Unassigned
          </span>
        )}
        {due ? (
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-person-blue px-2.5 text-xs font-bold text-primary">
            <CalendarDays className="h-3.5 w-3.5" />
            {due}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[0.68rem] font-semibold text-muted-foreground">
          {task.showOnCalendar ? "On calendar" : "Board only"}
        </span>
        {task.status !== "done" ? (
          <button
            type="button"
            onClick={() => planner.moveTask(task.id, "done")}
            className="flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-secondary-foreground hover:bg-secondary"
            aria-label={`Mark ${task.title} done`}
          >
            <Check className="h-4 w-4" />
            Done
          </button>
        ) : (
          <button
            type="button"
            onClick={() => planner.moveTask(task.id, task.assigneeId ? "assigned" : "open")}
            className="flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-primary hover:bg-person-blue"
          >
            <Circle className="h-4 w-4" />
            Reopen
          </button>
        )}
      </div>
    </article>
  );
}

function inputDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function TaskEditor({ task, onClose }: { task: FamilyTask; onClose: () => void }) {
  const planner = useFamilyPlanner();
  const [draft, setDraft] = useState<FamilyTask>(task);
  const save = () => {
    planner.updateTask(task.id, {
      title: draft.title.trim(),
      notes: draft.notes,
      listId: draft.listId,
      priority: draft.priority,
      assigneeId: draft.assigneeId,
      dueAt: draft.dueAt,
      showOnCalendar: draft.showOnCalendar,
    });
    if (draft.status !== task.status) planner.moveTask(task.id, draft.status, draft.assigneeId);
    onClose();
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-3xl p-5 sm:max-w-lg sm:p-6">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle>Edit card</DialogTitle>
          <DialogDescription>Assign it, give it a date, or mark it done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Task">
            <TextInput
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </Field>
          <Field label="Notes">
            <TextArea
              rows={3}
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="List">
              <select
                className="form-control"
                value={draft.listId}
                onChange={(event) => setDraft({ ...draft, listId: event.target.value })}
              >
                {planner.lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lane">
              <select
                className="form-control"
                value={draft.status === "done" ? "done" : "active"}
                onChange={(event) => {
                  const status = event.target.value as BoardLane;
                  setDraft({
                    ...draft,
                    status: status === "done" ? "done" : draft.assigneeId ? "assigned" : "open",
                  });
                }}
              >
                {LANES.map((lane) => (
                  <option key={lane.status} value={lane.status}>
                    {lane.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Assigned to">
              <select
                className="form-control"
                value={draft.assigneeId ?? ""}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    assigneeId: event.target.value || null,
                    status: event.target.value
                      ? draft.status === "done"
                        ? "done"
                        : "assigned"
                      : draft.status === "done"
                        ? "done"
                        : "open",
                  })
                }
              >
                <option value="">No one yet</option>
                {planner.people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date">
              <TextInput
                type="date"
                value={inputDate(draft.dueAt)}
                onChange={(event) => {
                  const dueAt = event.target.value
                    ? new Date(`${event.target.value}T12:00:00`).toISOString()
                    : null;
                  setDraft({
                    ...draft,
                    dueAt,
                    showOnCalendar: dueAt ? draft.showOnCalendar || !draft.dueAt : false,
                  });
                }}
              />
            </Field>
          </div>
          {draft.dueAt ? (
            <label className="flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3">
              <span>
                <span className="block text-sm font-bold">Show on calendar</span>
                <span className="block text-xs text-muted-foreground">
                  Dated cards are shown by default
                </span>
              </span>
              <Toggle
                checked={draft.showOnCalendar}
                onChange={(showOnCalendar) => setDraft({ ...draft, showOnCalendar })}
              />
            </label>
          ) : null}
          <Button size="lg" disabled={!draft.title.trim()} onClick={save}>
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
