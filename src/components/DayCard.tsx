import { useState } from "react";
import { Clock, RefreshCw, Utensils, ChevronDown } from "lucide-react";
import { INGREDIENT_MAP } from "@/data/ingredients";
import { RECIPE_MAP } from "@/data/recipes";
import type { HouseholdMemberGroup, MealPlanDay } from "@/domain/types";
import { formatDay } from "@/lib/planner";
import { formatQty } from "@/lib/units";
import { Button, Card, Chip } from "@/components/ui-kit";

function MealBlock({
  group,
  recipeId,
  sharedIds,
  onReplace,
}: {
  group: HouseholdMemberGroup;
  recipeId: string;
  sharedIds: string[];
  onReplace: () => void;
}) {
  const [open, setOpen] = useState(false);
  const recipe = RECIPE_MAP[recipeId];
  if (!recipe) return null;
  const tone = group.id === "kids" ? "kids" : "adults";

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Chip tone={tone}>{group.shortName.toUpperCase()} DINNER</Chip>
          <h4 className="mt-2 text-base font-semibold leading-snug">{recipe.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {recipe.minutes} min
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={onReplace}>
          <RefreshCw className="h-3.5 w-3.5" /> Replace meal
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
          <Utensils className="h-3.5 w-3.5" /> View ingredients
          <ChevronDown className={`h-3.5 w-3.5 ${open ? "rotate-180" : ""} transition-transform`} />
        </Button>
      </div>
      {open ? (
        <ul className="mt-3 rounded-xl bg-secondary/60 p-3 text-sm">
          {recipe.ingredients.map((ri) => {
            const ing = INGREDIENT_MAP[ri.ingredientId];
            const shared = sharedIds.includes(ri.ingredientId);
            return (
              <li key={ri.ingredientId} className="flex justify-between gap-3 py-1">
                <span className={shared ? "font-medium text-shared" : ""}>
                  {ing?.name ?? ri.ingredientId}
                  {shared ? " · shared" : ""}
                </span>
                <span className="text-muted-foreground">{formatQty(ri.quantity, ri.unit)}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function DayCard({
  day,
  groups,
  onReplace,
  onRegenerateDay,
}: {
  day: MealPlanDay;
  groups: HouseholdMemberGroup[];
  onReplace: (groupId: string) => void;
  onRegenerateDay: () => void;
}) {
  const sharedNames = day.sharedIngredientIds
    .map((id) => INGREDIENT_MAP[id]?.name)
    .filter(Boolean) as string[];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {formatDay(day.date)}
        </h3>
        <Button size="sm" variant="ghost" onClick={onRegenerateDay}>
          <RefreshCw className="h-3.5 w-3.5" /> Regenerate day
        </Button>
      </div>

      <div className="mt-2 divide-y divide-border">
        {[...groups]
          .sort((a, b) => a.order - b.order)
          .map((group) => {
            const meal = day.meals.find((m) => m.groupId === group.id);
            if (!meal) return null;
            return (
              <MealBlock
                key={group.id}
                group={group}
                recipeId={meal.recipeId}
                sharedIds={day.sharedIngredientIds}
                onReplace={() => onReplace(group.id)}
              />
            );
          })}
      </div>

      {sharedNames.length ? (
        <div className="mt-4 rounded-xl bg-shared-soft px-3.5 py-3">
          <p className="text-xs font-semibold text-shared">Shared ingredients</p>
          <p className="text-sm text-shared/90 mt-1">{sharedNames.join(" · ")}</p>
        </div>
      ) : null}
    </Card>
  );
}
