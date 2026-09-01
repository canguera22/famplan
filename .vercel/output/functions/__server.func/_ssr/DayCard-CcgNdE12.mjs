import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as Chip, n as Button, r as Card } from "./ui-kit-DfxQ38YT.mjs";
import { L as ChevronDown, j as Clock, n as Utensils, y as RefreshCw } from "../_libs/lucide-react.mjs";
import { a as RECIPE_MAP, d as formatQty, l as formatDay, r as INGREDIENT_MAP } from "./store-C31UwfQs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DayCard-CcgNdE12.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MealBlock({ group, recipeId, sharedIds, onReplace }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const recipe = RECIPE_MAP[recipeId];
	if (!recipe) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-4 first:pt-0 last:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-start justify-between gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
							tone: group.id === "kids" ? "kids" : "adults",
							children: [group.shortName.toUpperCase(), " DINNER"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "mt-2 text-base font-semibold leading-snug",
							children: recipe.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: recipe.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }),
								" ",
								recipe.minutes,
								" min"
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: onReplace,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), " Replace meal"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => setOpen((v) => !v),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, { className: "h-3.5 w-3.5" }),
						" View ingredients",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-3.5 w-3.5 ${open ? "rotate-180" : ""} transition-transform` })
					]
				})]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 rounded-xl bg-secondary/60 p-3 text-sm",
				children: recipe.ingredients.map((ri) => {
					const ing = INGREDIENT_MAP[ri.ingredientId];
					const shared = sharedIds.includes(ri.ingredientId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: shared ? "font-medium text-shared" : "",
							children: [ing?.name ?? ri.ingredientId, shared ? " · shared" : ""]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: formatQty(ri.quantity, ri.unit)
						})]
					}, ri.ingredientId);
				})
			}) : null
		]
	});
}
function DayCard({ day, groups, onReplace, onRegenerateDay }) {
	const sharedNames = day.sharedIngredientIds.map((id) => INGREDIENT_MAP[id]?.name).filter(Boolean);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
					children: formatDay(day.date)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: onRegenerateDay,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), " Regenerate day"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 divide-y divide-border",
				children: [...groups].sort((a, b) => a.order - b.order).map((group) => {
					const meal = day.meals.find((m) => m.groupId === group.id);
					if (!meal) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MealBlock, {
						group,
						recipeId: meal.recipeId,
						sharedIds: day.sharedIngredientIds,
						onReplace: () => onReplace(group.id)
					}, group.id);
				})
			}),
			sharedNames.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-xl bg-shared-soft px-3.5 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-shared",
					children: "Shared ingredients"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-shared/90 mt-1",
					children: sharedNames.join(" · ")
				})]
			}) : null
		]
	});
}
//#endregion
export { DayCard as t };
