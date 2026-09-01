import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Chip, EmptyState } from "@/components/ui-kit";
import { RECIPE_MAP } from "@/data/recipes";
import type { Rating } from "@/domain/types";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Meal history — Mesa" },
      {
        name: "description",
        content:
          "What your household has eaten, how often, and separate adult and kids ratings that shape future plans.",
      },
      { property: "og:title", content: "Meal history — Mesa" },
      {
        property: "og:description",
        content: "Track served meals and rate them separately for adults and kids.",
      },
    ],
  }),
  component: HistoryPage,
});

const RATINGS: Array<{ value: Rating; label: string }> = [
  { value: "loved", label: "Loved it" },
  { value: "fine", label: "Fine" },
  { value: "never", label: "Don't repeat" },
];

function HistoryPage() {
  const { history, household, rateMeal } = useStore();
  const entries = [...history].sort((a, b) => (b.lastServed ?? "").localeCompare(a.lastServed ?? ""));

  return (
    <AppShell title="History" subtitle="Ratings feed back into future weekly plans.">
      {!entries.length ? (
        <EmptyState title="No history yet" body="Approve a week and served meals will show up here." />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const recipe = RECIPE_MAP[entry.recipeId];
            if (!recipe) return null;
            return (
              <Card key={entry.recipeId}>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone={recipe.groupId === "kids" ? "kids" : "adults"}>
                    {recipe.groupId === "kids" ? "KIDS" : "ADULTS"}
                  </Chip>
                  <h3 className="text-base font-semibold">{recipe.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Served {entry.timesServed}× · Last served{" "}
                  {entry.lastServed
                    ? new Date(entry.lastServed + "T00:00:00").toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })
                    : "never"}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {household.groups.map((group) => {
                    const current = entry.ratings.find((r) => r.groupId === group.id)?.rating;
                    return (
                      <div key={group.id}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {group.shortName} rating
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {RATINGS.map((r) => (
                            <Button
                              key={r.value}
                              size="sm"
                              variant={current === r.value ? "primary" : "secondary"}
                              onClick={() => rateMeal(entry.recipeId, group.id, r.value)}
                            >
                              {r.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
