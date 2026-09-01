import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { f as cn, n as Button, r as Card } from "./ui-kit-DfxQ38YT.mjs";
import { n as personFor, r as useFamilyPlanner } from "./family-store-Qtb0DRS7.mjs";
import { E as ListTodo, F as ChevronRight, H as CalendarCheck2, I as ChevronLeft, M as Clock3 } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-CuVKoJXo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function startOfWeek(date) {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	const day = next.getDay();
	next.setDate(next.getDate() - (day === 0 ? 6 : day - 1));
	return next;
}
function dayKey(value) {
	const date = typeof value === "string" ? new Date(value) : value;
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
function CalendarPage() {
	const planner = useFamilyPlanner();
	const [anchor, setAnchor] = (0, import_react.useState)(() => startOfWeek(/* @__PURE__ */ new Date()));
	const days = (0, import_react.useMemo)(() => Array.from({ length: 7 }, (_, index) => {
		const date = new Date(anchor);
		date.setDate(anchor.getDate() + index);
		return date;
	}), [anchor]);
	const today = dayKey(/* @__PURE__ */ new Date());
	const items = (0, import_react.useMemo)(() => [...planner.events.map((event) => ({
		id: event.id,
		title: event.title,
		at: event.startsAt,
		allDay: event.allDay,
		assigneeId: event.assigneeId,
		kind: "event",
		done: false
	})), ...planner.tasks.filter((task) => task.showOnCalendar && task.dueAt).map((task) => ({
		id: task.id,
		title: task.title,
		at: task.dueAt,
		allDay: task.allDay,
		assigneeId: task.assigneeId,
		kind: "task",
		done: task.status === "done"
	}))], [planner.events, planner.tasks]);
	const shiftWeek = (amount) => setAnchor((current) => {
		const next = new Date(current);
		next.setDate(next.getDate() + amount * 7);
		return next;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Calendar",
		subtitle: "One shared view of appointments, activities and dated tasks.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg font-bold",
					children: `${new Intl.DateTimeFormat("en", {
						month: "short",
						day: "numeric"
					}).format(days[0])} – ${new Intl.DateTimeFormat("en", {
						month: "short",
						day: "numeric",
						year: "numeric"
					}).format(days[6])}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Europe/Madrid"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: () => setAnchor(startOfWeek(/* @__PURE__ */ new Date())),
							children: "Today"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => shiftWeek(-1),
							className: "icon-button",
							"aria-label": "Previous week",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => shiftWeek(1),
							className: "icon-button",
							"aria-label": "Next week",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-5 w-5" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden overflow-hidden rounded-3xl border border-border bg-card md:grid md:grid-cols-7",
				children: days.map((date) => {
					const dateItems = items.filter((item) => dayKey(item.at) === dayKey(date)).sort((a, b) => a.at.localeCompare(b.at));
					const isToday = dayKey(date) === today;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "min-h-[31rem] border-r border-border last:border-r-0",
						"aria-label": new Intl.DateTimeFormat("en", {
							weekday: "long",
							month: "long",
							day: "numeric"
						}).format(date),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("border-b border-border px-3 py-4 text-center", isToday && "bg-person-blue"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground",
								children: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("mx-auto mt-1 grid h-9 w-9 place-items-center rounded-full text-lg font-bold", isToday && "bg-primary text-primary-foreground"),
								children: date.getDate()
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 p-2",
							children: [dateItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarItem, {
								item,
								person: personFor(planner.people, item.assigneeId),
								compact: true
							}, `${item.kind}_${item.id}`)), !dateItems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-1 py-3 text-center text-xs text-muted-foreground",
								children: "Clear"
							}) : null]
						})]
					}, dayKey(date));
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4 md:hidden",
				children: days.map((date) => {
					const dateItems = items.filter((item) => dayKey(item.at) === dayKey(date)).sort((a, b) => a.at.localeCompare(b.at));
					const isToday = dayKey(date) === today;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"aria-labelledby": `day-${dayKey(date)}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-baseline gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									id: `day-${dayKey(date)}`,
									className: cn("font-bold", isToday && "text-primary"),
									children: new Intl.DateTimeFormat("en", { weekday: "long" }).format(date)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: new Intl.DateTimeFormat("en", {
										month: "short",
										day: "numeric"
									}).format(date)
								}),
								isToday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-person-blue px-2 py-0.5 text-[0.68rem] font-bold text-primary",
									children: "Today"
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "overflow-hidden p-0",
							children: dateItems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border",
								children: dateItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarItem, {
									item,
									person: personFor(planner.people, item.assigneeId)
								}, `${item.kind}_${item.id}`))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-4 py-5 text-sm text-muted-foreground",
								children: "Nothing planned."
							})
						})]
					}, dayKey(date));
				})
			})
		]
	});
}
function CalendarItem({ item, person, compact = false }) {
	const time = item.allDay ? "All day" : new Intl.DateTimeFormat("en", {
		hour: "numeric",
		minute: "2-digit"
	}).format(new Date(item.at));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", compact ? "rounded-xl border border-border p-2.5" : "flex gap-3 px-4 py-4", item.done && "opacity-55"),
		children: [
			!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1 h-10 w-1 shrink-0 rounded-full", item.kind === "task" ? "bg-secondary-foreground" : "bg-primary") }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 text-[0.68rem] font-bold text-muted-foreground",
						children: [item.kind === "task" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck2, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.kind === "task" ? "TASK" : time })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-1 font-semibold leading-snug", compact ? "text-xs" : "text-sm", item.done && "line-through"),
						children: item.title
					}),
					!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1.5 flex items-center gap-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "h-3.5 w-3.5" }),
							time,
							person ? ` · ${person.name}` : ""
						]
					}) : null
				]
			}),
			person && !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-[0.68rem] font-bold",
				title: person.name,
				children: person.shortName
			}) : null
		]
	});
}
//#endregion
export { CalendarPage as component };
