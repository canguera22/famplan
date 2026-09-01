import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, Field, OptionRow, SectionTitle, TextInput } from "@/components/ui-kit";
import type { GroupPreference, HouseholdPreference } from "@/domain/types";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/preferences")({
  head: () => ({
    meta: [
      { title: "Household preferences — Mesa" },
      {
        name: "description",
        content:
          "Tell the planner what your adults and kids like, dislike and are learning to eat, plus budget and ingredient-reuse priorities.",
      },
      { property: "og:title", content: "Household preferences — Mesa" },
      {
        property: "og:description",
        content: "Tastes, restrictions, budget and reuse priorities for your household.",
      },
    ],
  }),
  component: PreferencesPage,
});

const listToText = (list: string[]) => list.join(", ");
const textToList = (text: string) =>
  text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

function PreferencesPage() {
  const { preferences, setPreferences, household } = useStore();

  const setGroup = (groupId: string, patch: Partial<GroupPreference>) =>
    setPreferences({
      ...preferences,
      groups: preferences.groups.map((g) => (g.groupId === groupId ? { ...g, ...patch } : g)),
    });

  const setShared = (patch: Partial<HouseholdPreference>) =>
    setPreferences({ ...preferences, ...patch });

  return (
    <AppShell title="Preferences" subtitle="The planner keeps these in mind every time it generates.">
      <div className="space-y-4">
        {household.groups.map((group) => {
          const prefs = preferences.groups.find((g) => g.groupId === group.id);
          if (!prefs) return null;
          const isKids = group.id === "kids";
          return (
            <Card key={group.id}>
              <SectionTitle
                title={`${group.name} preferences`}
                subtitle={`${group.memberCount} people in this group`}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Foods we like">
                  <TextInput
                    value={listToText(prefs.likes)}
                    onChange={(e) => setGroup(group.id, { likes: textToList(e.target.value) })}
                  />
                </Field>
                <Field label="Foods we dislike">
                  <TextInput
                    value={listToText(prefs.dislikes)}
                    onChange={(e) => setGroup(group.id, { dislikes: textToList(e.target.value) })}
                  />
                </Field>
                <Field label="Dietary restrictions">
                  <TextInput
                    value={listToText(prefs.restrictions)}
                    onChange={(e) => setGroup(group.id, { restrictions: textToList(e.target.value) })}
                  />
                </Field>
                <Field label="Preferred proteins">
                  <TextInput
                    value={listToText(prefs.proteins)}
                    onChange={(e) => setGroup(group.id, { proteins: textToList(e.target.value) })}
                  />
                </Field>
                {isKids ? (
                  <>
                    <Field label="Currently being introduced">
                      <TextInput
                        value={listToText(prefs.introducing)}
                        onChange={(e) =>
                          setGroup(group.id, { introducing: textToList(e.target.value) })
                        }
                      />
                    </Field>
                    <Field label="Preferred vegetables">
                      <TextInput
                        value={listToText(prefs.vegetables)}
                        onChange={(e) =>
                          setGroup(group.id, { vegetables: textToList(e.target.value) })
                        }
                      />
                    </Field>
                  </>
                ) : (
                  <Field label="Preferred cuisines">
                    <TextInput
                      value={listToText(prefs.cuisines)}
                      onChange={(e) => setGroup(group.id, { cuisines: textToList(e.target.value) })}
                    />
                  </Field>
                )}
                <Field label="Maximum cooking time">
                  <OptionRow
                    value={prefs.maxMinutes}
                    onChange={(maxMinutes) => setGroup(group.id, { maxMinutes })}
                    options={[20, 30, 45, 60].map((n) => ({ value: n, label: `${n} min` }))}
                  />
                </Field>
                <Field label={isKids ? "Maximum complexity" : "Desired variety"}>
                  {isKids ? (
                    <OptionRow
                      value={prefs.maxComplexity}
                      onChange={(maxComplexity) =>
                        setGroup(group.id, { maxComplexity: maxComplexity as 1 | 2 | 3 })
                      }
                      options={[
                        { value: 1 as const, label: "Very simple" },
                        { value: 2 as const, label: "Moderate" },
                        { value: 3 as const, label: "Anything" },
                      ]}
                    />
                  ) : (
                    <OptionRow
                      value={prefs.variety}
                      onChange={(variety) => setGroup(group.id, { variety })}
                      options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))}
                    />
                  )}
                </Field>
              </div>
            </Card>
          );
        })}

        <Card>
          <SectionTitle title="Shared household" subtitle="Budget, reuse and weekly balance." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Weekly grocery budget target (€)">
              <TextInput
                type="number"
                min={0}
                value={preferences.budget}
                onChange={(e) => setShared({ budget: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Ingredient reuse priority">
              <OptionRow
                value={preferences.reusePriority}
                onChange={(reusePriority) => setShared({ reusePriority })}
                options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))}
              />
            </Field>
            <Field label="Food waste reduction priority">
              <OptionRow
                value={preferences.wastePriority}
                onChange={(wastePriority) => setShared({ wastePriority })}
                options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))}
              />
            </Field>
            <Field label="Preferred fish meals per week">
              <OptionRow
                value={preferences.fishMeals}
                onChange={(fishMeals) => setShared({ fishMeals })}
                options={[0, 1, 2, 3].map((n) => ({ value: n, label: String(n) }))}
              />
            </Field>
            <Field label="Preferred vegetarian meals per week">
              <OptionRow
                value={preferences.vegetarianMeals}
                onChange={(vegetarianMeals) => setShared({ vegetarianMeals })}
                options={[0, 1, 2, 3].map((n) => ({ value: n, label: String(n) }))}
              />
            </Field>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
