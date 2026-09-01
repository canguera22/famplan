import { INGREDIENT_MAP } from "@/data/ingredients";
import { RECIPE_MAP } from "@/data/recipes";
import type {
  MealPlan,
  ShoppingList,
  ShoppingListItem,
  ShoppingListItemUsage,
  Staple,
} from "@/domain/types";
import { toBase } from "./units";

/**
 * Consolidates every meal ingredient across all member groups into a single
 * basket: duplicates merged, quantities summed in a normalized base unit,
 * rounded up to realistic package sizes, and annotated with the meals that use
 * them. Shared adult/kids ingredients are counted once per meal only.
 */
export function buildShoppingList(plan: MealPlan, staples: Staple[]): ShoppingList {
  const map = new Map<string, ShoppingListItem>();

  for (const day of plan.days) {
    for (const meal of day.meals) {
      const recipe = RECIPE_MAP[meal.recipeId];
      if (!recipe) continue;
      const usage: ShoppingListItemUsage = {
        date: day.date,
        groupId: meal.groupId,
        recipeName: recipe.name,
      };
      // de-duplicate ingredient rows inside a single recipe first
      const perRecipe = new Map<string, number>();
      for (const ri of recipe.ingredients) {
        const qty = toBase(ri.ingredientId, ri.quantity, ri.unit);
        perRecipe.set(ri.ingredientId, (perRecipe.get(ri.ingredientId) ?? 0) + qty);
      }
      for (const [ingredientId, qty] of perRecipe) {
        const ing = INGREDIENT_MAP[ingredientId];
        if (!ing) continue;
        const existing = map.get(ingredientId);
        if (existing) {
          existing.requiredQuantity += qty;
          if (!existing.usages.some((u) => u.date === usage.date && u.groupId === usage.groupId))
            existing.usages.push(usage);
        } else {
          map.set(ingredientId, {
            id: `item_${ingredientId}`,
            ingredientId,
            name: ing.name,
            category: ing.category,
            requiredQuantity: qty,
            unit: ing.baseUnit,
            purchaseQuantity: 0,
            purchaseLabel: "",
            estimatedPrice: 0,
            source: "meals",
            usages: [usage],
            removed: false,
            pantry: false,
          });
        }
      }
    }
  }

  for (const staple of staples.filter((s) => s.active)) {
    const ing = staple.name ? INGREDIENT_MAP[staple.id] : undefined;
    const key = `staple_${staple.id}`;
    map.set(key, {
      id: key,
      ingredientId: ing?.id ?? null,
      name: staple.name,
      category: staple.category,
      requiredQuantity: staple.quantity,
      unit: staple.unit,
      purchaseQuantity: 0,
      purchaseLabel: "",
      estimatedPrice: 0,
      source: "staple",
      usages: [],
      removed: false,
      pantry: false,
    });
  }

  const items = [...map.values()].map(applyPackaging);

  return {
    id: `list_${Date.now()}`,
    mealPlanId: plan.id,
    createdAt: new Date().toISOString(),
    approved: false,
    items,
  };
}

/** Round a required quantity up to whole supermarket packages. */
export function applyPackaging(item: ShoppingListItem): ShoppingListItem {
  const ing = item.ingredientId ? INGREDIENT_MAP[item.ingredientId] : undefined;
  if (!ing) {
    return {
      ...item,
      purchaseQuantity: Math.max(1, Math.ceil(item.requiredQuantity)),
      purchaseLabel: `${Math.max(1, Math.ceil(item.requiredQuantity))} × ${item.unit}`,
      estimatedPrice: Math.max(1, Math.ceil(item.requiredQuantity)) * 1.5,
    };
  }
  const packs = Math.max(1, Math.ceil(item.requiredQuantity / ing.packageSize));
  return {
    ...item,
    purchaseQuantity: packs,
    purchaseLabel: `${packs} × ${ing.packageLabel}`,
    estimatedPrice: Math.round(packs * ing.estimatedPrice * 100) / 100,
  };
}

export function listTotals(list: ShoppingList) {
  const active = list.items.filter((i) => !i.removed && !i.pantry);
  return {
    products: active.reduce((n, i) => n + i.purchaseQuantity, 0),
    lines: active.length,
    cost: Math.round(active.reduce((n, i) => n + i.estimatedPrice, 0) * 100) / 100,
  };
}