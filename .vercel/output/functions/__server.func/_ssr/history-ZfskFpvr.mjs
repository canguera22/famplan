import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as EmptyState, i as Chip, n as Button, r as Card } from "./ui-kit-DfxQ38YT.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
import { a as RECIPE_MAP, b as useStore } from "./store-C31UwfQs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-ZfskFpvr.js
var import_jsx_runtime = require_jsx_runtime();
var RATINGS = [
	{
		value: "loved",
		label: "Loved it"
	},
	{
		value: "fine",
		label: "Fine"
	},
	{
		value: "never",
		label: "Don't repeat"
	}
];
function HistoryPage() {
	const { history, household, rateMeal } = useStore();
	const entries = [...history].sort((a, b) => (b.lastServed ?? "").localeCompare(a.lastServed ?? ""));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "History",
		subtitle: "Ratings feed back into future weekly plans.",
		children: !entries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No history yet",
			body: "Approve a week and served meals will show up here."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: entries.map((entry) => {
				const recipe = RECIPE_MAP[entry.recipeId];
				if (!recipe) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							tone: recipe.groupId === "kids" ? "kids" : "adults",
							children: recipe.groupId === "kids" ? "KIDS" : "ADULTS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold",
							children: recipe.name
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: [
							"Served ",
							entry.timesServed,
							"× · Last served",
							" ",
							entry.lastServed ? (/* @__PURE__ */ new Date(entry.lastServed + "T00:00:00")).toLocaleDateString("en-GB", {
								day: "numeric",
								month: "short"
							}) : "never"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: household.groups.map((group) => {
							const current = entry.ratings.find((r) => r.groupId === group.id)?.rating;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
								children: [group.shortName, " rating"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: RATINGS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: current === r.value ? "primary" : "secondary",
									onClick: () => rateMeal(entry.recipeId, group.id, r.value),
									children: r.label
								}, r.value))
							})] }, group.id);
						})
					})
				] }, entry.recipeId);
			})
		})
	});
}
//#endregion
export { HistoryPage as component };
