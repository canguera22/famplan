export type TaskStatus = "open" | "assigned" | "done";
export type TaskPriority = "low" | "normal" | "high";

export interface FamilyPerson {
  id: string;
  userId: string | null;
  name: string;
  shortName: string;
  color: "blue" | "green" | "amber" | "violet";
}

export interface FamilyList {
  id: string;
  name: string;
  description: string;
  color: "blue" | "green" | "amber";
}

export interface FamilyTask {
  id: string;
  listId: string;
  title: string;
  notes: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueAt: string | null;
  allDay: boolean;
  showOnCalendar: boolean;
  completedAt: string | null;
}

export interface FamilyEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  assigneeId: string | null;
  source: "manual" | "meal";
}

export interface NewTaskInput {
  title: string;
  notes?: string;
  listId?: string;
  assigneeId?: string | null;
  dueAt?: string | null;
  allDay?: boolean;
  showOnCalendar?: boolean;
  priority?: TaskPriority;
}

export interface NewEventInput {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  allDay?: boolean;
  assigneeId?: string | null;
}
