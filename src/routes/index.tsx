import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  Circle,
  Clock3,
  ListTodo,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button, Card } from "@/components/ui-kit";
import { RECIPE_MAP } from "@/data/recipes";
import type { FamilyTask } from "@/domain/family";
import { personFor, useFamilyPlanner } from "@/lib/family-store";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Mesa Family Planner" },
      { name: "description", content: "Everything your family needs today, in one calm view." },
    ],
  }),
  component: HomePage,
});

function dateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );
}

function HomePage() {
  const { profile } = useAuth();
  const planner = useFamilyPlanner();
  const meals = useStore();
  const now = new Date();
  const today = dateKey(now);
  const todayEvents = planner.events
    .filter((event) => dateKey(event.startsAt) === today)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const dueToday = planner.tasks.filter(
    (task) => task.status !== "done" && task.dueAt && dateKey(task.dueAt) === today,
  );
  const openTasks = planner.tasks.filter((task) => task.status !== "done");
  const unassigned = openTasks.filter((task) => !task.assigneeId);
  const todayPlan = meals.plan?.days.find((day) => dateKey(day.date) === today);

  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile?.display_name?.split(" ")[0] || "there";
  const fullDate = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);

  return (
    <AppShell
      title={`${greeting}, ${firstName}`}
      subtitle={`${fullDate} · Here’s what the family needs today.`}
    >
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Family overview">
        <SummaryCard
          icon={CalendarDays}
          label="Today"
          value={`${todayEvents.length + dueToday.length} planned`}
          tone="blue"
          to="/calendar"
        />
        <SummaryCard
          icon={ListTodo}
          label="Open tasks"
          value={String(openTasks.length)}
          tone="green"
          to="/lists"
        />
        <SummaryCard
          icon={Circle}
          label="Need an owner"
          value={String(unassigned.length)}
          tone="amber"
          to="/lists"
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)]">
        <div className="space-y-6">
          <section aria-labelledby="today-heading">
            <SectionHeading
              id="today-heading"
              title="Today"
              linkTo="/calendar"
              linkLabel="Open calendar"
            />
            <Card className="overflow-hidden p-0">
              {todayEvents.length || dueToday.length ? (
                <div className="divide-y divide-border">
                  {todayEvents.map((event) => {
                    const person = personFor(planner.people, event.assigneeId);
                    return (
                      <Link
                        key={event.id}
                        to="/calendar"
                        className="flex min-h-14 gap-4 px-4 py-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring/15 sm:px-5"
                      >
                        <div className="w-16 shrink-0 pt-0.5 text-sm font-bold tabular-nums text-primary">
                          {event.allDay ? "All day" : formatTime(event.startsAt)}
                        </div>
                        <span
                          className="mt-1 h-10 w-1 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{event.title}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {event.description ||
                              (person ? `${person.name} is going` : "Family event")}
                          </p>
                        </div>
                        {person ? (
                          <PersonBadge
                            name={person.name}
                            shortName={person.shortName}
                            color={person.color}
                          />
                        ) : null}
                      </Link>
                    );
                  })}
                  {dueToday.map((task) => (
                    <HomeTaskRow key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-secondary-foreground" />
                  <p className="mt-3 font-semibold">Today is clear</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nothing scheduled yet. Enjoy the breathing room.
                  </p>
                </div>
              )}
            </Card>
          </section>

          <section aria-labelledby="week-heading">
            <SectionHeading
              id="week-heading"
              title="Coming up"
              linkTo="/calendar"
              linkLabel="See full week"
            />
            <UpcomingAgenda />
          </section>
        </div>

        <aside className="space-y-6">
          <section aria-labelledby="dinner-heading">
            <SectionHeading
              id="dinner-heading"
              title="Tonight’s dinner"
              linkTo="/meals"
              linkLabel="Meals"
            />
            <Card className="bg-gradient-to-br from-secondary to-card">
              {todayPlan ? (
                <div className="space-y-4">
                  {todayPlan.meals.map((meal) => {
                    const recipe = RECIPE_MAP[meal.recipeId];
                    if (!recipe) return null;
                    return (
                      <div key={meal.id}>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-secondary-foreground">
                          {meal.groupId === "kids" ? "Kids" : "Adults"}
                        </p>
                        <p className="mt-1 font-semibold leading-snug">{recipe.name}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" /> {recipe.minutes} min
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-card text-secondary-foreground">
                    <ChefHat className="h-5 w-5" />
                  </span>
                  <p className="mt-4 font-semibold">Dinner isn’t planned yet</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Generate adult and kids dinners that share ingredients.
                  </p>
                  <Link to="/meals">
                    <Button className="mt-4">
                      Plan meals <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </section>

          <section aria-labelledby="attention-heading">
            <SectionHeading
              id="attention-heading"
              title="Needs attention"
              linkTo="/lists"
              linkLabel="Open lists"
            />
            <Card className="space-y-3">
              {unassigned.length ? (
                unassigned.slice(0, 3).map((task) => (
                  <Link
                    key={task.id}
                    to="/lists"
                    className="flex min-h-11 items-start gap-3 rounded-xl p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                  >
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{task.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Waiting for someone to take it
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Everything has an owner.</p>
              )}
            </Card>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
  to,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  tone: "blue" | "green" | "amber";
  to: "/calendar" | "/lists";
}) {
  const tones = {
    blue: "bg-person-blue text-primary",
    green: "bg-person-green text-secondary-foreground",
    amber: "bg-person-amber text-accent-foreground",
  };
  return (
    <Link
      to={to}
      aria-label={`${label}: ${value}`}
      className="group rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
    >
      <Card className="flex h-full min-h-20 items-center gap-3 p-4 transition-colors group-hover:border-primary/30 group-hover:bg-muted/60">
        <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-lg font-bold">{value}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </Card>
    </Link>
  );
}

function SectionHeading({
  id,
  title,
  linkTo,
  linkLabel,
}: {
  id: string;
  title: string;
  linkTo: "/calendar" | "/lists" | "/meals";
  linkLabel: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 id={id} className="text-lg font-bold">
        {title}
      </h2>
      <Link
        to={linkTo}
        className="flex min-h-11 items-center gap-1 text-sm font-bold text-primary hover:underline"
      >
        {linkLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function HomeTaskRow({ task }: { task: FamilyTask }) {
  const planner = useFamilyPlanner();
  const person = personFor(planner.people, task.assigneeId);
  return (
    <div className="flex gap-4 px-4 py-4 sm:px-5">
      <button
        type="button"
        onClick={() => planner.moveTask(task.id, "done")}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
        aria-label={`Complete ${task.title}`}
      >
        <Circle className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1 pt-2">
        <Link
          to="/lists"
          className="block rounded-lg font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
        >
          {task.title}
        </Link>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Due today{person ? ` · ${person.name}` : " · Unassigned"}
        </p>
      </div>
      {person ? (
        <PersonBadge name={person.name} shortName={person.shortName} color={person.color} />
      ) : null}
    </div>
  );
}

function PersonBadge({
  name,
  shortName,
  color,
}: {
  name: string;
  shortName: string;
  color: "blue" | "green" | "amber" | "violet";
}) {
  const colors = {
    blue: "bg-person-blue text-primary",
    green: "bg-person-green text-secondary-foreground",
    amber: "bg-person-amber text-accent-foreground",
    violet: "bg-person-violet text-violet-700",
  };
  return (
    <span
      title={name}
      aria-label={name}
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold",
        colors[color],
      )}
    >
      {shortName}
    </span>
  );
}

function UpcomingAgenda() {
  const planner = useFamilyPlanner();
  const start = new Date();
  start.setHours(23, 59, 59, 999);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const upcoming = [
    ...planner.events.map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      at: event.startsAt,
      assigneeId: event.assigneeId,
      kind: "Event",
    })),
    ...planner.tasks
      .filter((task) => task.status !== "done" && task.dueAt)
      .map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        at: task.dueAt!,
        assigneeId: task.assigneeId,
        kind: "Task",
      })),
  ]
    .filter((item) => {
      const date = new Date(item.at);
      return date > start && date <= end;
    })
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(0, 6);

  return (
    <Card className="overflow-hidden p-0">
      {upcoming.length ? (
        <div className="divide-y divide-border">
          {upcoming.map((item) => {
            const person = personFor(planner.people, item.assigneeId);
            return (
              <Link
                key={item.id}
                to="/calendar"
                className="grid min-h-16 grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring/15 sm:px-5"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    {new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(item.at))}
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-muted-foreground">
                    {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
                      new Date(item.at),
                    )}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.kind}
                    {person ? ` · ${person.name}` : " · Family"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-8 text-center">
          <CalendarDays className="mx-auto h-7 w-7 text-secondary-foreground" />
          <p className="mt-3 font-semibold">The week ahead is clear</p>
          <p className="mt-1 text-sm text-muted-foreground">
            New dated tasks and events will appear here automatically.
          </p>
        </div>
      )}
    </Card>
  );
}
