import { createFileRoute, Link, useNavigate, useHydrated } from "@tanstack/react-router";
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ShoppingBasket,
  Repeat2,
  History,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DayCard } from "@/components/DayCard";
import {
  Button,
  Card,
  EmptyState,
  Field,
  OptionRow,
  SectionTitle,
  TextArea,
} from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { formatDay, startOfWeek, isoDate } from "@/lib/planner";

export const Route = createFileRoute("/meals")({
  head: () => ({ meta: [{ title: "Meals — Mesa Family Planner" }] }),
  component: MealsPage,
});

function MealsPage() {
  const store = useStore();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const week = startOfWeek();
  const weekEnd = new Date(week);
  weekEnd.setDate(week.getDate() + 6);
  const plan = store.plan;

  return (
    <AppShell
      title="Meals"
      subtitle={
        hydrated
          ? `${formatDay(isoDate(week))} – ${formatDay(isoDate(weekEnd))} · Adult and kids dinners, planned together.`
          : "Adult and kids dinners, planned together."
      }
    >
      <nav className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Meal tools">
        {[
          { to: "/shopping" as const, label: "Shopping", icon: ShoppingBasket },
          { to: "/staples" as const, label: "Staples", icon: Repeat2 },
          { to: "/history" as const, label: "History", icon: History },
          { to: "/preferences" as const, label: "Preferences", icon: SlidersHorizontal },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-sm font-bold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      {!plan ? (
        <Card>
          <SectionTitle
            title="Plan this week"
            subtitle="Set a few boundaries, then let Mesa handle the deciding."
          />
          <PlannerControls />
          <Button size="lg" className="mt-6 sm:w-auto" onClick={store.generate}>
            <Sparkles className="h-4 w-4" /> Generate meals
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <details className="surface p-5">
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
              Planning settings
            </summary>
            <div className="mt-4">
              <PlannerControls />
            </div>
          </details>
          {plan.days.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              groups={store.household.groups}
              onReplace={(groupId) => store.replaceMeal(day.id, groupId)}
              onRegenerateDay={() => store.regenerateDay(day.id)}
            />
          ))}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button variant="secondary" onClick={store.regenerateWeek}>
              <RefreshCw className="h-4 w-4" /> Regenerate week
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                store.approvePlan();
                navigate({ to: "/shopping" });
              }}
            >
              <CheckCircle2 className="h-4 w-4" /> Approve meals & build shopping list
            </Button>
          </div>
        </div>
      )}
      {!plan ? (
        <div className="mt-4">
          <EmptyState
            title="No meal plan yet"
            body="Generate a week of separate adult and kids dinners that deliberately share ingredients."
          />
        </div>
      ) : null}
    </AppShell>
  );
}

function PlannerControls() {
  const { options, setOptions } = useStore();
  return (
    <div className="grid gap-5">
      <Field label="Number of dinners">
        <OptionRow
          value={options.dinnerCount}
          onChange={(dinnerCount) => setOptions({ dinnerCount })}
          options={[2, 3, 4, 5, 6, 7].map((n) => ({ value: n, label: String(n) }))}
        />
      </Field>
      <Field label="Adult cooking effort">
        <OptionRow
          value={options.adultEffort}
          onChange={(adultEffort) => setOptions({ adultEffort })}
          options={[
            { value: "easy" as const, label: "Easy" },
            { value: "normal" as const, label: "Normal" },
            { value: "adventurous" as const, label: "Adventurous" },
          ]}
        />
      </Field>
      <Field label="Kids meal preference">
        <OptionRow
          value={options.kidsStyle}
          onChange={(kidsStyle) => setOptions({ kidsStyle })}
          options={[
            { value: "very_simple" as const, label: "Very simple" },
            { value: "normal" as const, label: "Normal" },
            { value: "try_new" as const, label: "Try new foods" },
          ]}
        />
      </Field>
      <Field label="Maximum cooking time">
        <OptionRow
          value={options.maxMinutes}
          onChange={(maxMinutes) => setOptions({ maxMinutes })}
          options={[20, 30, 40, 60].map((n) => ({ value: n, label: `${n} min` }))}
        />
      </Field>
      <Field label="Notes" hint="e.g. “We are away Friday”, “Use more fish”, “Avoid pasta”">
        <TextArea
          rows={3}
          value={options.notes}
          onChange={(event) => setOptions({ notes: event.target.value })}
          placeholder="Anything we should know about this week?"
        />
      </Field>
    </div>
  );
}
