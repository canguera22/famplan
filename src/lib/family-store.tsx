import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  FamilyEvent,
  FamilyList,
  FamilyPerson,
  FamilyTask,
  NewEventInput,
  NewTaskInput,
  TaskStatus,
} from "@/domain/family";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type PersonRow = Database["public"]["Tables"]["people"]["Row"];
type ListRow = Database["public"]["Tables"]["lists"]["Row"];
type TaskRow = Database["public"]["Tables"]["list_cards"]["Row"];
type EventRow = Database["public"]["Tables"]["calendar_events"]["Row"];

interface FamilyPlannerState {
  people: FamilyPerson[];
  lists: FamilyList[];
  tasks: FamilyTask[];
  events: FamilyEvent[];
}

interface FamilyPlannerValue extends FamilyPlannerState {
  hydrated: boolean;
  addTask: (input: NewTaskInput) => string;
  updateTask: (taskId: string, patch: Partial<FamilyTask>) => void;
  moveTask: (taskId: string, status: TaskStatus, assigneeId?: string | null) => void;
  addEvent: (input: NewEventInput) => string;
  updateEvent: (eventId: string, patch: Partial<FamilyEvent>) => void;
  removeEvent: (eventId: string) => void;
}

const EMPTY_STATE: FamilyPlannerState = { people: [], lists: [], tasks: [], events: [] };
const FamilyPlannerContext = createContext<FamilyPlannerValue | null>(null);

const PERSON_COLORS: FamilyPerson["color"][] = ["blue", "green", "amber", "violet"];

function peopleFromRows(rows: PersonRow[]): FamilyPerson[] {
  const usedColors = new Set<FamilyPerson["color"]>();
  return rows.map((row, index) => {
    const savedColor = row.color as FamilyPerson["color"];
    const color =
      PERSON_COLORS.includes(savedColor) && !usedColors.has(savedColor)
        ? savedColor
        : (PERSON_COLORS.find((candidate) => !usedColors.has(candidate)) ??
          PERSON_COLORS[index % PERSON_COLORS.length]!);
    usedColors.add(color);
    return {
      id: row.id,
      userId: row.user_id,
      name: row.display_name,
      shortName: row.display_name.slice(0, 1).toUpperCase(),
      color,
    };
  });
}

function listFromRow(row: ListRow): FamilyList {
  const color: FamilyList["color"] =
    row.color === "amber" ? "amber" : row.color === "green" ? "green" : "blue";
  return { id: row.id, name: row.name, description: row.description, color };
}

function taskFromRow(row: TaskRow): FamilyTask {
  return {
    id: row.id,
    listId: row.list_id,
    title: row.title,
    notes: row.notes,
    status: row.status as FamilyTask["status"],
    priority: row.priority as FamilyTask["priority"],
    assigneeId: row.assignee_id,
    dueAt: row.due_at,
    allDay: row.all_day,
    showOnCalendar: row.show_on_calendar,
    completedAt: row.completed_at,
  };
}

function eventFromRow(row: EventRow): FamilyEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    allDay: row.all_day,
    assigneeId: row.assignee_id,
    recurrenceRule: row.recurrence_rule,
    source: row.source_type === "meal" ? "meal" : "manual",
  };
}

function reportSyncError(action: string, error: unknown) {
  console.error(`Supabase ${action} failed`, error);
}

export function FamilyPlannerProvider({ children }: { children: ReactNode }) {
  const { family, user } = useAuth();
  const [state, setState] = useState<FamilyPlannerState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);

  const loadFamily = useCallback(async () => {
    if (!family) {
      setState(EMPTY_STATE);
      setHydrated(true);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const [peopleResult, listsResult, tasksResult, eventsResult] = await Promise.all([
      supabase
        .from("people")
        .select("*")
        .eq("family_id", family.id)
        .eq("active", true)
        .order("created_at"),
      supabase
        .from("lists")
        .select("*")
        .eq("family_id", family.id)
        .is("archived_at", null)
        .order("position"),
      supabase.from("list_cards").select("*").eq("family_id", family.id).order("position"),
      supabase.from("calendar_events").select("*").eq("family_id", family.id).order("starts_at"),
    ]);

    const firstError =
      peopleResult.error || listsResult.error || tasksResult.error || eventsResult.error;
    if (firstError) throw firstError;

    setState({
      people: peopleFromRows(peopleResult.data ?? []),
      lists: (listsResult.data ?? []).map(listFromRow),
      tasks: (tasksResult.data ?? []).map(taskFromRow),
      events: (eventsResult.data ?? []).map(eventFromRow),
    });
    setHydrated(true);
  }, [family]);

  useEffect(() => {
    setHydrated(false);
    void loadFamily().catch((error: unknown) => {
      reportSyncError("initial load", error);
      setHydrated(true);
    });

    if (!family) return;
    const supabase = getSupabaseBrowserClient();
    const refresh = () =>
      void loadFamily().catch((error: unknown) => reportSyncError("realtime refresh", error));
    const channel = supabase
      .channel(`family:${family.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "people", filter: `family_id=eq.${family.id}` },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lists", filter: `family_id=eq.${family.id}` },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "list_cards", filter: `family_id=eq.${family.id}` },
        refresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_events",
          filter: `family_id=eq.${family.id}`,
        },
        refresh,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [family, loadFamily]);

  const value = useMemo<FamilyPlannerValue>(
    () => ({
      ...state,
      hydrated,
      addTask: (input) => {
        if (!family || !user) throw new Error("Your family workspace is not ready.");
        const id = crypto.randomUUID();
        const assigneeId = input.assigneeId ?? null;
        const dueAt = input.dueAt ?? null;
        const task: FamilyTask = {
          id,
          listId: input.listId ?? state.lists[0]?.id ?? "",
          title: input.title,
          notes: input.notes ?? "",
          status: assigneeId ? "assigned" : "open",
          priority: input.priority ?? "normal",
          assigneeId,
          dueAt,
          allDay: input.allDay ?? true,
          showOnCalendar: dueAt ? (input.showOnCalendar ?? true) : false,
          completedAt: null,
        };
        setState((current) => ({ ...current, tasks: [task, ...current.tasks] }));
        void getSupabaseBrowserClient()
          .from("list_cards")
          .insert({
            id,
            family_id: family.id,
            list_id: task.listId,
            title: task.title,
            notes: task.notes,
            status: task.status,
            assignee_id: task.assigneeId,
            due_at: task.dueAt,
            all_day: task.allDay,
            show_on_calendar: task.showOnCalendar,
            priority: task.priority,
            created_by: user.id,
          })
          .then(({ error }) => {
            if (error) {
              reportSyncError("task insert", error);
              setState((current) => ({
                ...current,
                tasks: current.tasks.filter((item) => item.id !== id),
              }));
            }
          });
        return id;
      },
      updateTask: (taskId, patch) => {
        const current = state.tasks.find((task) => task.id === taskId);
        if (!current) return;
        const next = { ...current, ...patch };
        if (!next.dueAt) next.showOnCalendar = false;
        if (patch.assigneeId !== undefined && next.status !== "done")
          next.status = patch.assigneeId ? "assigned" : "open";
        setState((value) => ({
          ...value,
          tasks: value.tasks.map((task) => (task.id === taskId ? next : task)),
        }));
        void getSupabaseBrowserClient()
          .from("list_cards")
          .update({
            list_id: next.listId,
            title: next.title,
            notes: next.notes,
            status: next.status,
            priority: next.priority,
            assignee_id: next.assigneeId,
            due_at: next.dueAt,
            all_day: next.allDay,
            show_on_calendar: next.showOnCalendar,
            completed_at: next.completedAt,
          })
          .eq("id", taskId)
          .then(({ error }) => error && reportSyncError("task update", error));
      },
      moveTask: (taskId, status, requestedAssignee) => {
        const current = state.tasks.find((task) => task.id === taskId);
        if (!current) return;
        const next: FamilyTask =
          status === "done"
            ? { ...current, status, completedAt: new Date().toISOString() }
            : status === "open"
              ? { ...current, status, assigneeId: null, completedAt: null }
              : {
                  ...current,
                  status,
                  assigneeId:
                    requestedAssignee ?? current.assigneeId ?? state.people[0]?.id ?? null,
                  completedAt: null,
                };
        if (status === "assigned" && !next.assigneeId) return;
        setState((value) => ({
          ...value,
          tasks: value.tasks.map((task) => (task.id === taskId ? next : task)),
        }));
        void getSupabaseBrowserClient()
          .from("list_cards")
          .update({
            status: next.status,
            assignee_id: next.assigneeId,
            completed_at: next.completedAt,
          })
          .eq("id", taskId)
          .then(({ error }) => error && reportSyncError("task move", error));
      },
      addEvent: (input) => {
        if (!family || !user) throw new Error("Your family workspace is not ready.");
        const id = crypto.randomUUID();
        const event: FamilyEvent = {
          id,
          title: input.title,
          description: input.description ?? "",
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          allDay: input.allDay ?? false,
          assigneeId: input.assigneeId ?? null,
          recurrenceRule: input.recurrenceRule ?? null,
          source: "manual",
        };
        setState((current) => ({ ...current, events: [...current.events, event] }));
        void getSupabaseBrowserClient()
          .from("calendar_events")
          .insert({
            id,
            family_id: family.id,
            title: event.title,
            description: event.description,
            starts_at: event.startsAt,
            ends_at: event.endsAt,
            all_day: event.allDay,
            assignee_id: event.assigneeId,
            recurrence_rule: event.recurrenceRule,
            source_type: "manual",
            created_by: user.id,
          })
          .then(({ error }) => {
            if (error) {
              reportSyncError("event insert", error);
              setState((current) => ({
                ...current,
                events: current.events.filter((item) => item.id !== id),
              }));
            }
          });
        return id;
      },
      updateEvent: (eventId, patch) => {
        const current = state.events.find((event) => event.id === eventId);
        if (!current) return;
        const next = { ...current, ...patch };
        setState((value) => ({
          ...value,
          events: value.events.map((event) => (event.id === eventId ? next : event)),
        }));
        void getSupabaseBrowserClient()
          .from("calendar_events")
          .update({
            title: next.title,
            description: next.description,
            starts_at: next.startsAt,
            ends_at: next.endsAt,
            all_day: next.allDay,
            assignee_id: next.assigneeId,
            recurrence_rule: next.recurrenceRule,
            source_type: next.source,
          })
          .eq("id", eventId)
          .then(({ error }) => error && reportSyncError("event update", error));
      },
      removeEvent: (eventId) => {
        setState((current) => ({
          ...current,
          events: current.events.filter((event) => event.id !== eventId),
        }));
        void getSupabaseBrowserClient()
          .from("calendar_events")
          .delete()
          .eq("id", eventId)
          .then(({ error }) => error && reportSyncError("event delete", error));
      },
    }),
    [family, hydrated, state, user],
  );

  return <FamilyPlannerContext.Provider value={value}>{children}</FamilyPlannerContext.Provider>;
}

export function useFamilyPlanner(): FamilyPlannerValue {
  const value = useContext(FamilyPlannerContext);
  if (!value) throw new Error("useFamilyPlanner must be used within FamilyPlannerProvider");
  return value;
}

export function personFor(people: FamilyPerson[], id: string | null): FamilyPerson | undefined {
  return id ? people.find((person) => person.id === id) : undefined;
}
