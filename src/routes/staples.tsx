import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Field, TextInput, Toggle } from "@/components/ui-kit";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/data/ingredients";
import type { IngredientCategory, Staple, Unit } from "@/domain/types";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/staples")({
  head: () => ({
    meta: [
      { title: "Household staples — Mesa" },
      {
        name: "description",
        content:
          "Recurring household items like milk, bread and coffee that are added to every weekly basket automatically.",
      },
      { property: "og:title", content: "Household staples — Mesa" },
      {
        property: "og:description",
        content: "Define the recurring items your household always needs.",
      },
    ],
  }),
  component: StaplesPage,
});

const UNITS: Unit[] = ["unit", "pack", "g", "kg", "ml", "l"];

function StaplesPage() {
  const { staples, setStaples } = useStore();
  const [name, setName] = useState("");

  const update = (id: string, patch: Partial<Staple>) =>
    setStaples(staples.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <AppShell
      title="Staples"
      subtitle="Always-on items. Active staples join every generated shopping list."
    >
      <Card className="mb-4">
        <div className="flex gap-3">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add a staple, e.g. Olive oil"
          />
          <Button
            disabled={!name.trim()}
            onClick={() => {
              setStaples([
                ...staples,
                {
                  id: `staple_${Date.now()}`,
                  name: name.trim(),
                  category: "other",
                  quantity: 1,
                  unit: "unit",
                  active: true,
                },
              ]);
              setName("");
            }}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {staples.map((staple) => (
          <Card key={staple.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <input
                  className="w-full bg-transparent text-base font-semibold outline-none"
                  value={staple.name}
                  onChange={(e) => update(staple.id, { name: e.target.value })}
                  aria-label="Staple name"
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label="Category">
                    <select
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
                      value={staple.category}
                      onChange={(e) =>
                        update(staple.id, { category: e.target.value as IngredientCategory })
                      }
                    >
                      {CATEGORY_ORDER.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Preferred quantity">
                    <TextInput
                      type="number"
                      min={0}
                      value={staple.quantity}
                      onChange={(e) => update(staple.id, { quantity: Number(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field label="Unit">
                    <select
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
                      value={staple.unit}
                      onChange={(e) => update(staple.id, { unit: e.target.value as Unit })}
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="Notes">
                    <TextInput
                      value={staple.notes ?? ""}
                      onChange={(e) => update(staple.id, { notes: e.target.value })}
                      placeholder="Optional"
                    />
                  </Field>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <Toggle checked={staple.active} onChange={(active) => update(staple.id, { active })} />
                <Button
                  size="sm"
                  variant="danger"
                  aria-label={`Delete ${staple.name}`}
                  onClick={() => setStaples(staples.filter((s) => s.id !== staple.id))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
