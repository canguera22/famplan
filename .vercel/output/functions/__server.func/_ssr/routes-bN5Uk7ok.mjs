import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { f as cn, m as useAuth, n as Button, r as Card } from "./ui-kit-DfxQ38YT.mjs";
import { n as personFor, r as useFamilyPlanner } from "./family-store-Qtb0DRS7.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as ListTodo, M as Clock3, N as Circle, P as CircleCheck, R as ChefHat, V as CalendarDays, W as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
import { a as RECIPE_MAP, b as useStore } from "./store-C31UwfQs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-bN5Uk7ok.js
var import_jsx_runtime = require_jsx_runtime();
function dateKey(value) {
	const date = typeof value === "string" ? new Date(value) : value;
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
function formatTime(value) {
	return new Intl.DateTimeFormat("en", {
		hour: "numeric",
		minute: "2-digit"
	}).format(new Date(value));
}
function HomePage() {
	const { profile } = useAuth();
	const planner = useFamilyPlanner();
	const meals = useStore();
	const now = /* @__PURE__ */ new Date();
	const today = dateKey(now);
	const todayEvents = planner.events.filter((event) => dateKey(event.startsAt) === today).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
	const dueToday = planner.tasks.filter((task) => task.status !== "done" && task.dueAt && dateKey(task.dueAt) === today);
	const openTasks = planner.tasks.filter((task) => task.status !== "done");
	const unassigned = openTasks.filter((task) => !task.assigneeId);
	const todayPlan = meals.plan?.days.find((day) => dateKey(day.date) === today);
	const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
	const firstName = profile?.display_name?.split(" ")[0] || "there";
	const fullDate = new Intl.DateTimeFormat("en", {
		weekday: "long",
		month: "long",
		day: "numeric"
	}).format(now);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: `${greeting}, ${firstName}`,
		subtitle: `${fullDate} · Here’s what the family needs today.`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-3 sm:grid-cols-3",
			"aria-label": "Family overview",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
					icon: CalendarDays,
					label: "Today",
					value: `${todayEvents.length + dueToday.length} planned`,
					tone: "blue"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
					icon: ListTodo,
					label: "Open tasks",
					value: String(openTasks.length),
					tone: "green"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
					icon: Circle,
					label: "Need an owner",
					value: String(unassigned.length),
					tone: "amber"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "today-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						id: "today-heading",
						title: "Today",
						linkTo: "/calendar",
						linkLabel: "Open calendar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "overflow-hidden p-0",
						children: todayEvents.length || dueToday.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "divide-y divide-border",
							children: [todayEvents.map((event) => {
								const person = personFor(planner.people, event.assigneeId);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-4 px-4 py-4 sm:px-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-16 shrink-0 pt-0.5 text-sm font-bold tabular-nums text-primary",
											children: event.allDay ? "All day" : formatTime(event.startsAt)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 h-10 w-1 rounded-full bg-primary",
											"aria-hidden": "true"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold",
												children: event.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-0.5 text-sm text-muted-foreground",
												children: event.description || (person ? `${person.name} is going` : "Family event")
											})]
										}),
										person ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonBadge, {
											name: person.name,
											shortName: person.shortName,
											color: person.color
										}) : null
									]
								}, event.id);
							}), dueToday.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeTaskRow, { task }, task.id))]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-10 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto h-8 w-8 text-secondary-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 font-semibold",
									children: "Today is clear"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Nothing scheduled yet. Enjoy the breathing room."
								})
							]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "week-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						id: "week-heading",
						title: "The next seven days",
						linkTo: "/calendar",
						linkLabel: "See full week"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeekStrip, {})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "dinner-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						id: "dinner-heading",
						title: "Tonight’s dinner",
						linkTo: "/meals",
						linkLabel: "Meals"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "bg-gradient-to-br from-secondary to-card",
						children: todayPlan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: todayPlan.meals.map((meal) => {
								const recipe = RECIPE_MAP[meal.recipeId];
								if (!recipe) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[0.7rem] font-bold uppercase tracking-[0.12em] text-secondary-foreground",
										children: meal.groupId === "kids" ? "Kids" : "Adults"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 font-semibold leading-snug",
										children: recipe.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 flex items-center gap-1.5 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "h-3.5 w-3.5" }),
											" ",
											recipe.minutes,
											" min"
										]
									})
								] }, meal.id);
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-10 w-10 place-items-center rounded-2xl bg-card text-secondary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChefHat, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 font-semibold",
								children: "Dinner isn’t planned yet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-6 text-muted-foreground",
								children: "Generate adult and kids dinners that share ingredients."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/meals",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "mt-4",
									children: ["Plan meals ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
								})
							})
						] })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "attention-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						id: "attention-heading",
						title: "Needs attention",
						linkTo: "/lists",
						linkLabel: "Open lists"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "space-y-3",
						children: unassigned.length ? unassigned.slice(0, 3).map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: task.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: "Waiting for someone to take it"
								})]
							})]
						}, task.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Everything has an owner."
						})
					})]
				})]
			})]
		})]
	});
}
function SummaryCard({ icon: Icon, label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "flex items-center gap-3 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("grid h-11 w-11 place-items-center rounded-2xl", {
				blue: "bg-person-blue text-primary",
				green: "bg-person-green text-secondary-foreground",
				amber: "bg-person-amber text-accent-foreground"
			}[tone]),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 text-lg font-bold",
			children: value
		})] })]
	});
}
function SectionHeading({ id, title, linkTo, linkLabel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3 flex items-center justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			id,
			className: "text-lg font-bold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: linkTo,
			className: "flex min-h-11 items-center gap-1 text-sm font-bold text-primary hover:underline",
			children: [linkLabel, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
		})]
	});
}
function HomeTaskRow({ task }) {
	const planner = useFamilyPlanner();
	const person = personFor(planner.people, task.assigneeId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-4 px-4 py-4 sm:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => planner.moveTask(task.id, "done"),
				className: "grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
				"aria-label": `Complete ${task.title}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-5 w-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: task.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-sm text-muted-foreground",
					children: ["Due today", person ? ` · ${person.name}` : " · Unassigned"]
				})]
			}),
			person ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonBadge, {
				name: person.name,
				shortName: person.shortName,
				color: person.color
			}) : null
		]
	});
}
function PersonBadge({ name, shortName, color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		title: name,
		"aria-label": name,
		className: cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold", {
			blue: "bg-person-blue text-primary",
			green: "bg-person-green text-secondary-foreground",
			amber: "bg-person-amber text-accent-foreground",
			violet: "bg-person-violet text-violet-700"
		}[color]),
		children: shortName
	});
}
function WeekStrip() {
	const planner = useFamilyPlanner();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-4 gap-2 sm:grid-cols-7",
		children: Array.from({ length: 7 }, (_, offset) => {
			const date = /* @__PURE__ */ new Date();
			date.setHours(12, 0, 0, 0);
			date.setDate(date.getDate() + offset);
			return date;
		}).map((date, index) => {
			const key = dateKey(date);
			const count = planner.events.filter((event) => dateKey(event.startsAt) === key).length + planner.tasks.filter((task) => task.showOnCalendar && task.dueAt && dateKey(task.dueAt) === key).length;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/calendar",
				className: cn("flex min-h-24 flex-col items-center justify-center rounded-2xl border border-border bg-card p-2 text-center transition-colors hover:border-primary/40", index === 0 && "border-primary/30 bg-person-blue"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground",
						children: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-xl font-bold tabular-nums",
						children: date.getDate()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-[0.68rem] font-semibold text-muted-foreground",
						children: count ? `${count} item${count > 1 ? "s" : ""}` : "Clear"
					})
				]
			}, key);
		})
	});
}
//#endregion
export { HomePage as component };
