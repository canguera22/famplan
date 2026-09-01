import { RECIPES, RECIPE_MAP } from "@/data/recipes";
import type {
  GenerationOptions,
  Household,
  HouseholdPreference,
  MealHistoryEntry,
  MealPlan,
  MealPlanDay,
  Recipe,
} from "@/domain/types";

export function startOfWeek(d = new Date()): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatDay(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
}

export function shortDay(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short" });
}

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export interface ParsedNotes {
  avoid: string[];
  favour: string[];
  skipDays: number[];
  alreadyHave: string[];
}

/** Very light natural-language parsing of the free-text notes field. */
export function parseNotes(notes: string): ParsedNotes {
  const text = notes.toLowerCase();
  const parsed: ParsedNotes = { avoid: [], favour: [], skipDays: [], alreadyHave: [] };
  const vocab = [
    "pasta",
    "fish",
    "chicken",
    "beef",
    "pork",
    "rice",
    "vegetarian",
    "prawns",
    "salmon",
  ];
  for (const word of vocab) {
    if (new RegExp(`(avoid|no|without|skip)[^.,;]{0,20}${word}`).test(text)) parsed.avoid.push(word);
    if (new RegExp(`(more|extra|use more)[^.,;]{0,20}${word}`).test(text)) parsed.favour.push(word);
    if (new RegExp(`(already have|we have|got)[^.,;]{0,20}${word}`).test(text))
      parsed.alreadyHave.push(word);
  }
  WEEKDAYS.forEach((d, i) => {
    if (new RegExp(`(away|out|not home|no dinner)[^.,;]{0,20}${d}|${d}[^.,;]{0,20}away`).test(text))
      parsed.skipDays.push(i);
  });
  return parsed;
}

function matchesText(recipe: Recipe, term: string): boolean {
  const hay = `${recipe.name} ${recipe.description} ${recipe.tags.join(" ")} ${recipe.protein}`;
  return hay.toLowerCase().includes(term);
}

function effortScore(recipe: Recipe, options: GenerationOptions): number {
  const target = options.adultEffort;
  if (recipe.effort === target) return 3;
  if (target === "normal") return 1;
  return 0;
}

function kidsScore(recipe: Recipe, options: GenerationOptions): number {
  if (options.kidsStyle === "very_simple") return recipe.complexity === 1 ? 3 : -2;
  if (options.kidsStyle === "try_new") return recipe.tags.includes("try_new") ? 3 : 0;
  return recipe.complexity <= 2 ? 2 : 0;
}

function ingredientIds(recipe: Recipe): Set<string> {
  return new Set(recipe.ingredients.map((i) => i.ingredientId));
}

export function sharedIngredients(a: Recipe, b: Recipe): string[] {
  const setB = ingredientIds(b);
  return [...ingredientIds(a)].filter((id) => setB.has(id));
}

interface PlanInput {
  household: Household;
  options: GenerationOptions;
  preferences: HouseholdPreference;
  history: MealHistoryEntry[];
  /** Recipe ids already used this week, avoided when possible */
  exclude?: string[];
  seed?: number;
}

function historyPenalty(recipeId: string, history: MealHistoryEntry[]): number {
  const entry = history.find((h) => h.recipeId === recipeId);
  if (!entry) return 0;
  let penalty = Math.min(entry.timesServed, 4) * 0.8;
  if (entry.ratings.some((r) => r.rating === "never")) penalty += 10;
  if (entry.ratings.some((r) => r.rating === "loved")) penalty -= 1.5;
  if (entry.lastServed) {
    const days = (Date.now() - new Date(entry.lastServed).getTime()) / 86_400_000;
    if (days < 14) penalty += 4;
  }
  return penalty;
}

function scoreAdult(recipe: Recipe, input: PlanInput, notes: ParsedNotes): number {
  const { options, preferences } = input;
  const group = preferences.groups.find((g) => g.groupId === "adults");
  let score = effortScore(recipe, options) + Math.random() * 1.5;
  if (recipe.minutes > options.maxMinutes) score -= 6;
  if (notes.avoid.some((t) => matchesText(recipe, t))) score -= 20;
  if (notes.favour.some((t) => matchesText(recipe, t))) score += 6;
  if (notes.alreadyHave.some((t) => matchesText(recipe, t))) score += 3;
  if (group) {
    if (group.dislikes.some((t) => matchesText(recipe, t.toLowerCase()))) score -= 12;
    if (group.likes.some((t) => matchesText(recipe, t.toLowerCase()))) score += 3;
    if (group.restrictions.some((t) => matchesText(recipe, t.toLowerCase()))) score -= 20;
    if (recipe.minutes > group.maxMinutes) score -= 3;
  }
  score -= historyPenalty(recipe.id, input.history);
  return score;
}

function scoreKids(
  recipe: Recipe,
  adultRecipe: Recipe,
  input: PlanInput,
  notes: ParsedNotes,
): number {
  const { options, preferences } = input;
  const group = preferences.groups.find((g) => g.groupId === "kids");
  const overlap = sharedIngredients(adultRecipe, recipe).length;
  // Ingredient reuse is the core objective of the paired planner.
  let score = overlap * (1.5 + preferences.reusePriority) + kidsScore(recipe, options);
  if (recipe.protein === adultRecipe.protein) score += 1.5;
  if (recipe.minutes > options.maxMinutes) score -= 4;
  if (notes.avoid.some((t) => matchesText(recipe, t))) score -= 20;
  if (group) {
    if (group.dislikes.some((t) => matchesText(recipe, t.toLowerCase()))) score -= 12;
    if (group.likes.some((t) => matchesText(recipe, t.toLowerCase()))) score += 2;
    if (group.introducing.some((t) => matchesText(recipe, t.toLowerCase()))) score += 2;
    if (group.restrictions.some((t) => matchesText(recipe, t.toLowerCase()))) score -= 20;
    if (recipe.complexity > group.maxComplexity) score -= 5;
  }
  score -= historyPenalty(recipe.id, input.history) * 0.6;
  return score + Math.random();
}

function adultPool(input: PlanInput, notes: ParsedNotes, used: string[]) {
  return RECIPES.filter((r) => r.groupId === "adults")
    .map((r) => ({ r, s: scoreAdult(r, input, notes) - (used.includes(r.id) ? 30 : 0) }))
    .sort((a, b) => b.s - a.s);
}

export function pickAdultRecipe(input: PlanInput, used: string[]): Recipe {
  const notes = parseNotes(input.options.notes);
  return adultPool(input, notes, used)[0]!.r;
}

export function pickKidsRecipe(input: PlanInput, adultRecipe: Recipe, used: string[]): Recipe {
  const notes = parseNotes(input.options.notes);
  const ranked = RECIPES.filter((r) => r.groupId === "kids")
    .map((r) => ({
      r,
      s: scoreKids(r, adultRecipe, input, notes) - (used.includes(r.id) ? 12 : 0),
    }))
    .sort((a, b) => b.s - a.s);
  return ranked[0]!.r;
}

export function buildDay(
  input: PlanInput,
  date: string,
  usedAdult: string[],
  usedKids: string[],
): MealPlanDay {
  const adult = pickAdultRecipe(input, usedAdult);
  const kids = pickKidsRecipe(input, adult, usedKids);
  return {
    id: `day_${date}_${Math.random().toString(36).slice(2, 7)}`,
    date,
    meals: [
      { id: `meal_${date}_adults`, recipeId: adult.id, groupId: "adults" },
      { id: `meal_${date}_kids`, recipeId: kids.id, groupId: "kids" },
    ],
    sharedIngredientIds: sharedIngredients(adult, kids),
  };
}

export function recomputeShared(day: MealPlanDay): MealPlanDay {
  const recipes = day.meals.map((m) => RECIPE_MAP[m.recipeId]).filter(Boolean) as Recipe[];
  if (recipes.length < 2) return { ...day, sharedIngredientIds: [] };
  const counts = new Map<string, number>();
  for (const rec of recipes)
    for (const id of new Set(rec.ingredients.map((i) => i.ingredientId)))
      counts.set(id, (counts.get(id) ?? 0) + 1);
  return {
    ...day,
    sharedIngredientIds: [...counts.entries()].filter(([, c]) => c > 1).map(([id]) => id),
  };
}

export function generatePlan(input: PlanInput): MealPlan {
  const notes = parseNotes(input.options.notes);
  const week = startOfWeek();
  const dates: string[] = [];
  for (let i = 0; i < 7 && dates.length < input.options.dinnerCount; i++) {
    if (notes.skipDays.includes(i)) continue;
    const d = new Date(week);
    d.setDate(week.getDate() + i);
    dates.push(isoDate(d));
  }
  const usedAdult: string[] = [];
  const usedKids: string[] = [];
  const days = dates.map((date) => {
    const day = buildDay(input, date, usedAdult, usedKids);
    day.meals.forEach((m) => (m.groupId === "adults" ? usedAdult : usedKids).push(m.recipeId));
    return day;
  });
  return {
    id: `plan_${Date.now()}`,
    weekStart: isoDate(week),
    createdAt: new Date().toISOString(),
    approved: false,
    days,
  };
}