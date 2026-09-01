import { createClient } from "npm:@supabase/supabase-js@2";
import { createOpenAIResponse, responseText, safetyIdentifier } from "../_shared/openai.ts";

const MODEL = "gpt-5.6-terra";
const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

interface MealGroup {
  id: string;
  name: string;
  memberCount: number;
  complexityCeiling: number;
}

interface RecipeInput {
  id: string;
  name: string;
  description: string;
  groupId: string;
  minutes: number;
  effort: string;
  complexity: number;
  tags: string[];
  protein: string;
  ingredientIds: string[];
}

interface MealRequest {
  weekStart: string;
  household: { groups: MealGroup[] };
  options: {
    dinnerCount: number;
    adultEffort: string;
    kidsStyle: string;
    maxMinutes: number;
    notes: string;
  };
  preferences: unknown;
  history: unknown;
  recipes: RecipeInput[];
}

interface Selection {
  date: string;
  meals: Array<{ groupId: string; recipeId: string }>;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function validateRequest(body: MealRequest): string | null {
  if (!isIsoDate(body.weekStart)) return "A valid week start is required.";
  if (
    !Number.isInteger(body.options?.dinnerCount) ||
    body.options.dinnerCount < 1 ||
    body.options.dinnerCount > 7
  )
    return "Dinner count must be between 1 and 7.";
  if (!body.household?.groups?.length) return "At least one household group is required.";
  if (!body.recipes?.length) return "The recipe catalog is required.";
  if (body.recipes.length > 250) return "The recipe catalog is too large.";
  return null;
}

function validateSelections(body: MealRequest, selections: Selection[]): string | null {
  if (selections.length !== body.options.dinnerCount)
    return "The plan has the wrong number of dinners.";
  const groupIds = new Set(body.household.groups.map((group) => group.id));
  const recipes = new Map(body.recipes.map((recipe) => [recipe.id, recipe]));
  const dates = new Set<string>();
  const weekStart = Date.parse(`${body.weekStart}T00:00:00Z`);
  const weekEnd = weekStart + 6 * 86_400_000;
  for (const day of selections) {
    const dateValue = Date.parse(`${day.date}T00:00:00Z`);
    if (!isIsoDate(day.date) || dateValue < weekStart || dateValue > weekEnd || dates.has(day.date))
      return "The plan contains an invalid or duplicate date.";
    dates.add(day.date);
    if (day.meals.length !== groupIds.size)
      return "Every day must include one meal per household group.";
    const usedGroups = new Set<string>();
    for (const meal of day.meals) {
      const recipe = recipes.get(meal.recipeId);
      if (!groupIds.has(meal.groupId) || usedGroups.has(meal.groupId))
        return "The plan contains an invalid group.";
      if (!recipe || recipe.groupId !== meal.groupId)
        return "The plan contains an invalid recipe selection.";
      usedGroups.add(meal.groupId);
    }
  }
  return null;
}

function sharedIngredients(meals: Selection["meals"], recipes: Map<string, RecipeInput>): string[] {
  const counts = new Map<string, number>();
  for (const meal of meals) {
    const ingredients = new Set(recipes.get(meal.recipeId)?.ingredientIds ?? []);
    for (const ingredient of ingredients) counts.set(ingredient, (counts.get(ingredient) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([ingredient]) => ingredient);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Not found" }, 404);

  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("bearer "))
    return json({ error: "Sign in required." }, 401);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: "Your session is no longer valid." }, 401);

  let body: MealRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const requestError = validateRequest(body);
  if (requestError) return json({ error: requestError }, 400);

  const groupIds = body.household.groups.map((group) => group.id);
  const recipeIds = body.recipes.map((recipe) => recipe.id);
  const schema = {
    type: "object",
    properties: {
      selections: {
        type: "array",
        minItems: body.options.dinnerCount,
        maxItems: body.options.dinnerCount,
        items: {
          type: "object",
          properties: {
            date: { type: "string" },
            meals: {
              type: "array",
              minItems: groupIds.length,
              maxItems: groupIds.length,
              items: {
                type: "object",
                properties: {
                  groupId: { type: "string", enum: groupIds },
                  recipeId: { type: "string", enum: recipeIds },
                },
                required: ["groupId", "recipeId"],
                additionalProperties: false,
              },
            },
          },
          required: ["date", "meals"],
          additionalProperties: false,
        },
      },
    },
    required: ["selections"],
    additionalProperties: false,
  };

  try {
    const response = await createOpenAIResponse({
      model: MODEL,
      store: false,
      reasoning: { effort: "none" },
      safety_identifier: await safetyIdentifier(user.id),
      instructions: [
        "You are Mesa's family meal planner. Select only recipe IDs from the supplied catalog.",
        "Return exactly the requested number of unique dinner dates within the supplied Monday-Sunday week.",
        "Include exactly one recipe for every household group on every selected date.",
        "Respect restrictions, dislikes, maximum time, effort, notes, and meal history.",
        "Prefer variety and maximize shared ingredients between groups so one grocery shop supports both meals.",
        "Never invent recipes, groups, dates outside the week, or ingredient IDs.",
      ].join(" "),
      input: JSON.stringify(body),
      max_output_tokens: 1800,
      text: {
        verbosity: "low",
        format: { type: "json_schema", name: "meal_plan", strict: true, schema },
      },
    });
    const parsed = JSON.parse(responseText(response)) as { selections?: Selection[] };
    const selections = parsed.selections ?? [];
    const selectionError = validateSelections(body, selections);
    if (selectionError) throw new Error(selectionError);

    const recipeMap = new Map(body.recipes.map((recipe) => [recipe.id, recipe]));
    const now = new Date().toISOString();
    const plan = {
      id: `plan_ai_${crypto.randomUUID()}`,
      weekStart: body.weekStart,
      createdAt: now,
      approved: false,
      days: selections
        .sort((left, right) => left.date.localeCompare(right.date))
        .map((day) => ({
          id: `day_${day.date}_${crypto.randomUUID().slice(0, 8)}`,
          date: day.date,
          meals: day.meals.map((meal) => ({
            id: `meal_${day.date}_${meal.groupId}`,
            groupId: meal.groupId,
            recipeId: meal.recipeId,
          })),
          sharedIngredientIds: sharedIngredients(day.meals, recipeMap),
        })),
    };
    return json({ plan, model: MODEL });
  } catch (error) {
    console.error("AI meal planning failed", error);
    return json({ error: "Mesa AI could not create a valid meal plan." }, 502);
  }
});
