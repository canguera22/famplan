import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as EmptyState, c as SectionTitle, l as TextArea, n as Button, o as Field, r as Card, s as OptionRow } from "./ui-kit-DfxQ38YT.mjs";
import { _ as useNavigate, y as useHydrated } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as CircleCheck, d as Sparkles, y as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
import { b as useStore, f as isoDate, l as formatDay, y as startOfWeek } from "./store-C31UwfQs.mjs";
import { t as DayCard } from "./DayCard-CcgNdE12.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/index 2-CAkK6pJQ.js
var import_jsx_runtime = require_jsx_runtime();
function WeekPage() {
	const store = useStore();
	const navigate = useNavigate();
	const hydrated = useHydrated();
	const week = startOfWeek();
	const weekEnd = new Date(week);
	weekEnd.setDate(week.getDate() + 6);
	const plan = store.plan;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "This week",
		subtitle: hydrated ? `${formatDay(isoDate(week))} – ${formatDay(isoDate(weekEnd))}` : void 0,
		children: [!plan ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				title: "Plan this week",
				subtitle: "Set a few boundaries, then we handle the deciding."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlannerControls, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "lg",
				className: "mt-6",
				onClick: store.generate,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), " Generate meals"]
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer text-sm font-semibold",
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
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), " Regenerate entire week"]
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
		}), !plan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No plan yet",
				body: "Generate a week and you'll get separate adult and kids dinners that deliberately share ingredients."
			})
		}) : null]
	});
}
function PlannerControls() {
	const { options, setOptions } = useStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Number of dinners to plan",
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
							label: "More adventurous"
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
					onChange: (e) => setOptions({ notes: e.target.value }),
					placeholder: "Anything we should know about this week?"
				})
			})
		]
	});
}
//#endregion
export { WeekPage as component };
