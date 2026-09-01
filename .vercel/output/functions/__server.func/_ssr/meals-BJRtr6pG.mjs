import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as EmptyState, c as SectionTitle, l as TextArea, n as Button, o as Field, r as Card, s as OptionRow } from "./ui-kit-DfxQ38YT.mjs";
import { _ as useNavigate, g as Link, y as useHydrated } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as History, P as CircleCheck, d as Sparkles, f as SlidersHorizontal, p as ShoppingBasket, v as Repeat2, y as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
import { b as useStore, f as isoDate, l as formatDay, y as startOfWeek } from "./store-C31UwfQs.mjs";
import { t as DayCard } from "./DayCard-CcgNdE12.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/meals-BJRtr6pG.js
var import_jsx_runtime = require_jsx_runtime();
function MealsPage() {
	const store = useStore();
	const navigate = useNavigate();
	const hydrated = useHydrated();
	const week = startOfWeek();
	const weekEnd = new Date(week);
	weekEnd.setDate(week.getDate() + 6);
	const plan = store.plan;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Meals",
		subtitle: hydrated ? `${formatDay(isoDate(week))} – ${formatDay(isoDate(weekEnd))} · Adult and kids dinners, planned together.` : "Adult and kids dinners, planned together.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4",
				"aria-label": "Meal tools",
				children: [
					{
						to: "/shopping",
						label: "Shopping",
						icon: ShoppingBasket
					},
					{
						to: "/staples",
						label: "Staples",
						icon: Repeat2
					},
					{
						to: "/history",
						label: "History",
						icon: History
					},
					{
						to: "/preferences",
						label: "Preferences",
						icon: SlidersHorizontal
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: "flex min-h-12 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-sm font-bold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-4 w-4" }), item.label]
				}, item.to))
			}),
			!plan ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
					title: "Plan this week",
					subtitle: "Set a few boundaries, then let Mesa handle the deciding."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlannerControls, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					className: "mt-6 sm:w-auto",
					onClick: store.generate,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), " Generate meals"]
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "surface p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "min-h-11 cursor-pointer py-2 text-sm font-semibold",
							children: "Planning settings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlannerControls, {})
						})]
					}),
					plan.days.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayCard, {
						day,
						groups: store.household.groups,
						onReplace: (groupId) => store.replaceMeal(day.id, groupId),
						onRegenerateDay: () => store.regenerateDay(day.id)
					}, day.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 pt-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: store.regenerateWeek,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), " Regenerate week"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "flex-1",
							onClick: () => {
								store.approvePlan();
								navigate({ to: "/shopping" });
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Approve meals & build shopping list"]
						})]
					})
				]
			}),
			!plan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No meal plan yet",
					body: "Generate a week of separate adult and kids dinners that deliberately share ingredients."
				})
			}) : null
		]
	});
}
function PlannerControls() {
	const { options, setOptions } = useStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Number of dinners",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
					value: options.dinnerCount,
					onChange: (dinnerCount) => setOptions({ dinnerCount }),
					options: [
						2,
						3,
						4,
						5,
						6,
						7
					].map((n) => ({
						value: n,
						label: String(n)
					}))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Adult cooking effort",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
					value: options.adultEffort,
					onChange: (adultEffort) => setOptions({ adultEffort }),
					options: [
						{
							value: "easy",
							label: "Easy"
						},
						{
							value: "normal",
							label: "Normal"
						},
						{
							value: "adventurous",
							label: "Adventurous"
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Kids meal preference",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
					value: options.kidsStyle,
					onChange: (kidsStyle) => setOptions({ kidsStyle }),
					options: [
						{
							value: "very_simple",
							label: "Very simple"
						},
						{
							value: "normal",
							label: "Normal"
						},
						{
							value: "try_new",
							label: "Try new foods"
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Maximum cooking time",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
					value: options.maxMinutes,
					onChange: (maxMinutes) => setOptions({ maxMinutes }),
					options: [
						20,
						30,
						40,
						60
					].map((n) => ({
						value: n,
						label: `${n} min`
					}))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Notes",
				hint: "e.g. “We are away Friday”, “Use more fish”, “Avoid pasta”",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
					rows: 3,
					value: options.notes,
					onChange: (event) => setOptions({ notes: event.target.value }),
					placeholder: "Anything we should know about this week?"
				})
			})
		]
	});
}
//#endregion
export { MealsPage as component };
