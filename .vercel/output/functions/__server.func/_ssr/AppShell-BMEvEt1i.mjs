import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as Toggle, f as cn, l as TextArea, m as useAuth, n as Button, o as Field, u as TextInput } from "./ui-kit-DfxQ38YT.mjs";
import { r as useFamilyPlanner } from "./family-store-Qtb0DRS7.mjs";
import { g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { B as CalendarPlus, D as House, E as ListTodo, R as ChefHat, V as CalendarDays, b as Plus, g as Settings, p as ShoppingBasket, t as X, u as SquareCheck } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-BMEvEt1i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
function localDate(offset = 0) {
	const date = /* @__PURE__ */ new Date();
	date.setDate(date.getDate() + offset);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function localIso(date, time) {
	return (/* @__PURE__ */ new Date(`${date}T${time}:00`)).toISOString();
}
function QuickAdd({ compact = false }) {
	const planner = useFamilyPlanner();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("task");
	const [title, setTitle] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [listId, setListId] = (0, import_react.useState)(planner.lists[0]?.id ?? "family_tasks");
	const [assigneeId, setAssigneeId] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)("");
	const [time, setTime] = (0, import_react.useState)("17:00");
	const [endTime, setEndTime] = (0, import_react.useState)("18:00");
	const [showOnCalendar, setShowOnCalendar] = (0, import_react.useState)(true);
	const canSubmit = (0, import_react.useMemo)(() => {
		if (!title.trim()) return false;
		return mode === "task" || Boolean(date && time && endTime);
	}, [
		date,
		endTime,
		mode,
		time,
		title
	]);
	const reset = () => {
		setTitle("");
		setNotes("");
		setAssigneeId("");
		setDate("");
		setTime("17:00");
		setEndTime("18:00");
		setShowOnCalendar(true);
	};
	const submit = () => {
		if (!canSubmit) return;
		if (mode === "task") planner.addTask({
			title: title.trim(),
			notes: notes.trim(),
			listId,
			assigneeId: assigneeId || null,
			dueAt: date ? localIso(date, "12:00") : null,
			allDay: true,
			showOnCalendar: date ? showOnCalendar : false
		});
		else planner.addEvent({
			title: title.trim(),
			description: notes.trim(),
			startsAt: localIso(date, time),
			endsAt: localIso(date, endTime),
			assigneeId: assigneeId || null
		});
		reset();
		setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: cn("min-h-11 shadow-sm", compact && "h-14 w-14 rounded-full p-0 shadow-lg [&_span]:sr-only"),
				"aria-label": "Quick add",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: compact ? "h-6 w-6" : "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Quick add" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-3xl border-border p-5 sm:max-w-lg sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "pr-8 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add to the family plan" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create a task or put something directly on the calendar." })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 rounded-2xl bg-muted p-1",
					role: "tablist",
					children: ["task", "event"].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "tab",
						"aria-selected": mode === value,
						onClick: () => {
							setMode(value);
							if (value === "event" && !date) setDate(localDate());
						},
						className: cn("flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors", mode === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"),
						children: [value === "task" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheck, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { className: "h-4 w-4" }), value === "task" ? "Task" : "Event"]
					}, value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: mode === "task" ? "What needs doing?" : "Event name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								autoFocus: true,
								value: title,
								onChange: (event) => setTitle(event.target.value),
								placeholder: mode === "task" ? "e.g. Return school form" : "e.g. Swimming lesson"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [mode === "task" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "List",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: listId,
									onChange: (event) => setListId(event.target.value),
									className: "form-control",
									children: planner.lists.map((list) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: list.id,
										children: list.name
									}, list.id))
								})
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Assign to",
								hint: "Optional",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: assigneeId,
									onChange: (event) => setAssigneeId(event.target.value),
									className: "form-control",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "No one yet"
									}), planner.people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: person.id,
										children: person.name
									}, person.id))]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("grid gap-4", mode === "event" && "sm:grid-cols-3"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: mode === "task" ? "Due date" : "Date",
								hint: mode === "task" ? "Optional" : "Required",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "date",
									value: date,
									onChange: (event) => setDate(event.target.value)
								})
							}), mode === "event" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Starts",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "time",
									value: time,
									onChange: (event) => setTime(event.target.value)
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Ends",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "time",
									value: endTime,
									onChange: (event) => setEndTime(event.target.value)
								})
							})] }) : null]
						}),
						mode === "task" && date ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-semibold",
								children: "Show on calendar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs text-muted-foreground",
								children: "On by default for dated tasks"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: showOnCalendar,
								onChange: setShowOnCalendar
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Notes",
							hint: "Optional",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
								rows: 3,
								value: notes,
								onChange: (event) => setNotes(event.target.value),
								placeholder: "Add any useful context"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					disabled: !canSubmit,
					onClick: submit,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
						" Add ",
						mode
					]
				})
			]
		})]
	});
}
var PRIMARY_NAV = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/calendar",
		label: "Calendar",
		icon: CalendarDays
	},
	{
		to: "/meals",
		label: "Meals",
		icon: ChefHat
	},
	{
		to: "/lists",
		label: "Lists",
		icon: ListTodo
	}
];
var MEAL_NAV = [{
	to: "/shopping",
	label: "Shopping list",
	icon: ShoppingBasket
}, {
	to: "/preferences",
	label: "Meal preferences",
	icon: Settings
}];
function isActive(pathname, to) {
	return to === "/" ? pathname === "/" : pathname.startsWith(to);
}
function AppShell({ title, subtitle, actions, children }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const { profile } = useAuth();
	const displayName = profile?.display_name || "Family member";
	const initial = displayName.slice(0, 1).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#main-content",
				className: "skip-link",
				children: "Skip to main content"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-3 rounded-xl px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-10 w-10 place-items-center rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground",
							children: "M"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-display text-lg font-bold tracking-tight",
							children: "Mesa"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs text-muted-foreground",
							children: "Family life, together."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-8 flex flex-col gap-1",
						"aria-label": "Primary navigation",
						children: PRIMARY_NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("nav-item", isActive(pathname, item.to) && "nav-item-active"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
								className: "h-5 w-5",
								strokeWidth: 2
							}), item.label]
						}, item.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-7 border-t border-border pt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground",
							children: "Meals & groceries"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "mt-2 flex flex-col gap-1",
							"aria-label": "Meal tools",
							children: MEAL_NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("nav-item", isActive(pathname, item.to) && "nav-item-active"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
									className: "h-5 w-5",
									strokeWidth: 2
								}), item.label]
							}, item.to))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAdd, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/settings",
							className: "flex min-h-12 items-center gap-3 rounded-2xl border border-border p-2.5 hover:bg-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-8 w-8 place-items-center rounded-full bg-person-blue text-xs font-bold text-primary",
									children: initial
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-semibold",
										children: displayName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: "Settings"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4 text-muted-foreground" })
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:pl-64",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "border-b border-border/70 bg-background/95 px-4 pb-4 pt-5 backdrop-blur sm:px-6 lg:px-10 lg:pb-5 lg:pt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex max-w-6xl items-start justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-3 flex items-center gap-2 lg:hidden",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid h-8 w-8 place-items-center rounded-xl bg-primary text-xs font-extrabold text-primary-foreground",
										children: "M"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-sm font-bold",
										children: "Mesa"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-2xl font-bold tracking-tight sm:text-3xl",
									children: title
								}),
								subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 max-w-2xl text-sm leading-6 text-muted-foreground",
									children: subtitle
								}) : null
							]
						}), actions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "shrink-0",
							children: actions
						}) : null]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					id: "main-content",
					className: "mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed bottom-24 right-4 z-40 lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAdd, { compact: true })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mobile-nav lg:hidden",
				"aria-label": "Primary navigation",
				children: PRIMARY_NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: cn("mobile-nav-item", isActive(pathname, item.to) && "mobile-nav-item-active"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
						className: "h-5 w-5",
						strokeWidth: 2.2
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
				}, item.to))
			})
		]
	});
}
//#endregion
export { DialogHeader as a, DialogDescription as i, Dialog as n, DialogTitle as o, DialogContent as r, AppShell as t };
