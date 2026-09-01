import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_HISTORY,
  DEFAULT_HOUSEHOLD,
  DEFAULT_OPTIONS,
  DEFAULT_PREFERENCES,
  DEFAULT_STAPLES,
} from "@/data/defaults";
import { RECIPE_MAP } from "@/data/recipes";
import type {
  GenerationOptions,
  Household,
  HouseholdPreference,
  MealHistoryEntry,
  MealPlan,
  Rating,
  ShoppingList,
  ShoppingListItem,
  Staple,
} from "@/domain/types";
import type { PreferredProduct, RetailerCart } from "@/domain/retail";
import { applyPackaging, buildShoppingList } from "./grocery";
import { buildRetailerCart, packagesFor, productById } from "./matching";
import { buildDay, generatePlan, pickAdultRecipe, pickKidsRecipe, recomputeShared } from "./planner";

interface AppState {
  household: Household;
  options: GenerationOptions;
  preferences: HouseholdPreference;
  staples: Staple[];
  history: MealHistoryEntry[];
  plan: MealPlan | null;
  list: ShoppingList | null;
  preferredProducts: PreferredProduct[];
  cart: RetailerCart | null;
}

const STORAGE_KEY = "mealplanner_state_v1";

const initialState: AppState = {
  household: DEFAULT_HOUSEHOLD,
  options: DEFAULT_OPTIONS,
  preferences: DEFAULT_PREFERENCES,
  staples: DEFAULT_STAPLES,
  history: DEFAULT_HISTORY,
  plan: null,
  list: null,
  preferredProducts: [],
  cart: null,
};

interface StoreValue extends AppState {
  hydrated: boolean;
  setOptions: (patch: Partial<GenerationOptions>) => void;
  setPreferences: (next: HouseholdPreference) => void;
  setStaples: (next: Staple[]) => void;
  generate: () => void;
  replaceMeal: (dayId: string, groupId: string) => void;
  regenerateDay: (dayId: string) => void;
  regenerateWeek: () => void;
  approvePlan: () => void;
  updateItem: (itemId: string, patch: Partial<ShoppingListItem>) => void;
  addManualItem: (item: Pick<ShoppingListItem, "name" | "category" | "requiredQuantity" | "unit">) => void;
  approveList: () => void;
  rateMeal: (recipeId: string, groupId: string, rating: Rating) => void;
  matchProducts: () => void;
  setLineProduct: (lineId: string, retailerProductId: string, remember: boolean) => void;
  setLineQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  addCartProduct: (retailerProductId: string) => void;
  setPreferredProduct: (ingredientId: string, retailerProductId: string) => void;
  markCartReviewed: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const planInput = useCallback(
    (s: AppState) => ({
      household: s.household,
      options: s.options,
      preferences: s.preferences,
      history: s.history,
    }),
    [],
  );

  const value = useMemo<StoreValue>(() => {
    const usedIds = (plan: MealPlan, groupId: string) =>
      plan.days.flatMap((d) => d.meals.filter((m) => m.groupId === groupId).map((m) => m.recipeId));

    return {
      ...state,
      hydrated,
      setOptions: (patch) => setState((s) => ({ ...s, options: { ...s.options, ...patch } })),
      setPreferences: (preferences) => setState((s) => ({ ...s, preferences })),
      setStaples: (staples) => setState((s) => ({ ...s, staples })),
      generate: () =>
        setState((s) => ({ ...s, plan: generatePlan(planInput(s)), list: null, cart: null })),
      regenerateWeek: () =>
        setState((s) => ({ ...s, plan: generatePlan(planInput(s)), list: null, cart: null })),
      regenerateDay: (dayId) =>
        setState((s) => {
          if (!s.plan) return s;
          const days = s.plan.days.map((d) =>
            d.id === dayId
              ? buildDay(
                  planInput(s),
                  d.date,
                  usedIds(s.plan!, "adults"),
                  usedIds(s.plan!, "kids"),
                )
              : d,
          );
          return { ...s, plan: { ...s.plan, days, approved: false }, list: null, cart: null };
        }),
      replaceMeal: (dayId, groupId) =>
        setState((s) => {
          if (!s.plan) return s;
          const days = s.plan.days.map((day) => {
            if (day.id !== dayId) return day;
            const current = day.meals.find((m) => m.groupId === groupId);
            const other = day.meals.find((m) => m.groupId !== groupId);
            const used = [
              ...usedIds(s.plan!, groupId).filter((id) => id !== current?.recipeId),
              ...(current ? [current.recipeId] : []),
            ];
            const input = planInput(s);
            const next =
              groupId === "adults"
                ? pickAdultRecipe(input, used)
                : pickKidsRecipe(
                    input,
                    RECIPE_MAP[other?.recipeId ?? ""] ?? RECIPE_MAP["a_stirfry"]!,
                    used,
                  );
            const meals = day.meals.map((m) =>
              m.groupId === groupId ? { ...m, recipeId: next.id } : m,
            );
            return recomputeShared({ ...day, meals });
          });
          return { ...s, plan: { ...s.plan, days, approved: false }, list: null, cart: null };
        }),
      approvePlan: () =>
        setState((s) => {
          if (!s.plan) return s;
          const plan = { ...s.plan, approved: true };
          const history = [...s.history];
          for (const day of plan.days)
            for (const meal of day.meals) {
              const entry = history.find((h) => h.recipeId === meal.recipeId);
              if (entry) {
                entry.timesServed += 1;
                entry.lastServed = day.date;
              } else {
                history.push({
                  recipeId: meal.recipeId,
                  lastServed: day.date,
                  timesServed: 1,
                  ratings: [],
                });
              }
            }
          return { ...s, plan, history, list: buildShoppingList(plan, s.staples) };
        }),
      updateItem: (itemId, patch) =>
        setState((s) => {
          if (!s.list) return s;
          const items = s.list.items.map((i) =>
            i.id === itemId
              ? patch.requiredQuantity !== undefined
                ? applyPackaging({ ...i, ...patch })
                : { ...i, ...patch }
              : i,
          );
          return { ...s, list: { ...s.list, items, approved: false }, cart: null };
        }),
      addManualItem: (item) =>
        setState((s) => {
          if (!s.list) return s;
          const next = applyPackaging({
            id: `manual_${Date.now()}`,
            ingredientId: null,
            purchaseQuantity: 0,
            purchaseLabel: "",
            estimatedPrice: 0,
            source: "manual",
            usages: [],
            removed: false,
            pantry: false,
            ...item,
          });
          return { ...s, list: { ...s.list, items: [...s.list.items, next] } };
        }),
      approveList: () =>
        setState((s) => (s.list ? { ...s, list: { ...s.list, approved: true } } : s)),
      matchProducts: () =>
        setState((s) =>
          s.list
            ? {
                ...s,
                list: { ...s.list, approved: true },
                cart: buildRetailerCart(s.list, {
                  householdId: s.household.id,
                  preferred: s.preferredProducts,
                }),
              }
            : s,
        ),
      setLineProduct: (lineId, retailerProductId, remember) =>
        setState((s) => {
          if (!s.cart) return s;
          const product = productById(retailerProductId);
          if (!product) return s;
          let preferredProducts = s.preferredProducts;
          const lines = s.cart.lines.map((line) => {
            if (line.id !== lineId) return line;
            if (remember && line.ingredientId) {
              const ingredientId = line.ingredientId;
              preferredProducts = [
                ...preferredProducts.filter((p) => p.ingredientId !== ingredientId),
                {
                  id: `pref_${ingredientId}`,
                  householdId: s.household.id,
                  ingredientId,
                  retailerProductId,
                },
              ];
            }
            return {
              ...line,
              retailerProductId,
              confidence: remember ? 0.99 : Math.max(line.confidence, 0.9),
              quantity: packagesFor(line.requiredQuantity, product),
            };
          });
          return { ...s, preferredProducts, cart: { ...s.cart, lines, reviewed: false } };
        }),
      setLineQuantity: (lineId, quantity) =>
        setState((s) =>
          s.cart
            ? {
                ...s,
                cart: {
                  ...s.cart,
                  lines: s.cart.lines.map((l) =>
                    l.id === lineId ? { ...l, quantity: Math.max(0, quantity) } : l,
                  ),
                },
              }
            : s,
        ),
      removeLine: (lineId) =>
        setState((s) =>
          s.cart
            ? {
                ...s,
                cart: { ...s.cart, lines: s.cart.lines.filter((l) => l.id !== lineId) },
              }
            : s,
        ),
      addCartProduct: (retailerProductId) =>
        setState((s) => {
          if (!s.cart) return s;
          const product = productById(retailerProductId);
          if (!product) return s;
          const line = {
            id: `line_extra_${retailerProductId}_${s.cart.lines.length}`,
            shoppingItemId: `extra_${retailerProductId}`,
            ingredientId: null,
            ingredientName: product.name,
            category: product.category,
            requiredQuantity: product.packageSize,
            unit: product.packageUnit,
            retailerProductId,
            confidence: 1,
            quantity: 1,
            source: "manual" as const,
            usages: [],
          };
          return { ...s, cart: { ...s.cart, lines: [...s.cart.lines, line] } };
        }),
      setPreferredProduct: (ingredientId, retailerProductId) =>
        setState((s) => ({
          ...s,
          preferredProducts: [
            ...s.preferredProducts.filter((p) => p.ingredientId !== ingredientId),
            { id: `pref_${ingredientId}`, householdId: s.household.id, ingredientId, retailerProductId },
          ],
        })),
      markCartReviewed: () =>
        setState((s) => (s.cart ? { ...s, cart: { ...s.cart, reviewed: true } } : s)),
      rateMeal: (recipeId, groupId, rating) =>
        setState((s) => {
          const history = s.history.map((h) => ({ ...h, ratings: [...h.ratings] }));
          let entry = history.find((h) => h.recipeId === recipeId);
          if (!entry) {
            entry = { recipeId, lastServed: null, timesServed: 0, ratings: [] };
            history.push(entry);
          }
          const existing = entry.ratings.find((r) => r.groupId === groupId);
          if (existing) existing.rating = rating;
          else entry.ratings.push({ groupId, rating });
          return { ...s, history };
        }),
    };
  }, [state, hydrated, planInput]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}