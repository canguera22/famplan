import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as Toggle, f as cn, l as TextArea, n as Button, o as Field, u as TextInput } from "./ui-kit-DfxQ38YT.mjs";
import { n as personFor, r as useFamilyPlanner } from "./family-store-Qtb0DRS7.mjs";
import { E as ListTodo, L as ChevronDown, N as Circle, V as CalendarDays, i as UserRound, z as Check } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, i as DialogDescription, n as Dialog, o as DialogTitle, r as DialogContent, t as AppShell } from "./AppShell-BMEvEt1i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lists-BpMS7Paq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LANES = [
	{
		status: "open",
		label: "Open",
		helper: "Waiting for an owner"
	},
	{
		status: "assigned",
		label: "Assigned",
		helper: "Someone is on it"
	},
	{
		status: "done",
		label: "Done",
		helper: "Completed"
	}
];
function ListsPage() {
	const planner = useFamilyPlanner();
	const [listId, setListId] = (0, import_react.useState)(planner.lists[0]?.id ?? "family_tasks");
	const [mobileLane, setMobileLane] = (0, import_react.useState)("open");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const selected = planner.lists.find((list) => list.id === listId) ?? planner.lists[0];
	const tasks = planner.tasks.filter((task) => task.listId === selected.id);
	const drop = (event, status) => {
		event.preventDefault();
		const taskId = event.dataTransfer.getData("text/mesa-task");
		if (taskId) planner.moveTask(taskId, status);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Lists",
		subtitle: "Shared boards for everything the family needs to get done.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "list-picker",
							className: "text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground",
							children: "Current board"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mt-1.5 max-w-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: "list-picker",
								value: listId,
								onChange: (event) => setListId(event.target.value),
								className: "form-control appearance-none pr-10 font-bold",
								children: planner.lists.map((list) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: list.id,
									children: list.name
								}, list.id))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "pointer-events-none absolute right-3 top-3 h-5 w-5 text-muted-foreground" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: selected.description
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-4 w-4 text-primary" }), " Dated cards appear on the calendar by default"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 grid grid-cols-3 rounded-2xl bg-muted p-1 md:hidden",
				role: "tablist",
				"aria-label": "Task lanes",
				children: LANES.map((lane) => {
					const count = tasks.filter((task) => task.status === lane.status).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "tab",
						"aria-selected": mobileLane === lane.status,
						onClick: () => setMobileLane(lane.status),
						className: cn("min-h-12 rounded-xl px-2 text-sm font-bold transition-colors", mobileLane === lane.status ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"),
						children: [lane.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1 text-xs",
							children: count
						})]
					}, lane.status);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden grid-cols-3 gap-4 md:grid",
				children: LANES.map((lane) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanLane, {
					lane,
					tasks: tasks.filter((task) => task.status === lane.status),
					onEdit: setEditing,
					onDrop: (event) => drop(event, lane.status)
				}, lane.status))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:hidden",
				children: LANES.filter((lane) => lane.status === mobileLane).map((lane) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanLane, {
					lane,
					tasks: tasks.filter((task) => task.status === lane.status),
					onEdit: setEditing,
					onDrop: (event) => drop(event, lane.status),
					mobile: true
				}, lane.status))
			}),
			editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskEditor, {
				task: editing,
				onClose: () => setEditing(null)
			}, editing.id) : null
		]
	});
}
function KanbanLane({ lane, tasks, onEdit, onDrop, mobile = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		onDragOver: (event) => event.preventDefault(),
		onDrop,
		className: cn("rounded-3xl bg-muted/70 p-3", !mobile && "min-h-[32rem]"),
		"aria-labelledby": `lane-${lane.status}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 px-1 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				id: `lane-${lane.status}`,
				className: "flex items-center gap-2 text-sm font-bold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-2.5 w-2.5 rounded-full", lane.status === "open" ? "bg-accent" : lane.status === "assigned" ? "bg-primary" : "bg-secondary-foreground") }), lane.label]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: lane.helper
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 min-w-8 place-items-center rounded-full bg-card px-2 text-xs font-bold",
				children: tasks.length
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 space-y-3",
			children: [tasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanCard, {
				task,
				onEdit: () => onEdit(task)
			}, task.id)), !tasks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-dashed border-border px-4 py-8 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, { className: "mx-auto h-5 w-5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs font-semibold text-muted-foreground",
					children: "No cards here"
				})]
			}) : null]
		})]
	});
}
function KanbanCard({ task, onEdit }) {
	const planner = useFamilyPlanner();
	const person = personFor(planner.people, task.assigneeId);
	const due = task.dueAt ? new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric"
	}).format(new Date(task.dueAt)) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		draggable: true,
		onDragStart: (event) => {
			event.dataTransfer.setData("text/mesa-task", task.id);
			event.dataTransfer.effectAllowed = "move";
		},
		className: cn("group rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_oklch(0.2_0.02_250/0.04)]", task.status === "done" && "opacity-70"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onEdit,
				className: "w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 rounded-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("font-semibold leading-snug", task.status === "done" && "line-through"),
						children: task.title
					}), task.priority === "high" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-destructive/10 px-2 py-0.5 text-[0.65rem] font-bold text-destructive",
						children: "HIGH"
					}) : null]
				}), task.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground",
					children: task.notes
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2",
				children: [person ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex min-h-8 items-center gap-1.5 rounded-full bg-muted px-2.5 text-xs font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-5 w-5 place-items-center rounded-full bg-card text-[0.6rem]",
						children: person.shortName
					}), person.name]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex min-h-8 items-center gap-1.5 rounded-full bg-person-amber px-2.5 text-xs font-bold text-accent-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "h-3.5 w-3.5" }), "Unassigned"]
				}), due ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex min-h-8 items-center gap-1.5 rounded-full bg-person-blue px-2.5 text-xs font-bold text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3.5 w-3.5" }), due]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between border-t border-border pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[0.68rem] font-semibold text-muted-foreground",
					children: task.showOnCalendar ? "On calendar" : "Board only"
				}), task.status !== "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => planner.moveTask(task.id, "done"),
					className: "flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-secondary-foreground hover:bg-secondary",
					"aria-label": `Mark ${task.title} done`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), "Done"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => planner.moveTask(task.id, task.assigneeId ? "assigned" : "open"),
					className: "flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-primary hover:bg-person-blue",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-4 w-4" }), "Reopen"]
				})]
			})
		]
	});
}
function inputDate(value) {
	if (!value) return "";
	const date = new Date(value);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function TaskEditor({ task, onClose }) {
	const planner = useFamilyPlanner();
	const [draft, setDraft] = (0, import_react.useState)(task);
	const save = () => {
		planner.updateTask(task.id, {
			title: draft.title.trim(),
			notes: draft.notes,
			listId: draft.listId,
			priority: draft.priority,
			assigneeId: draft.assigneeId,
			dueAt: draft.dueAt,
			showOnCalendar: draft.showOnCalendar
		});
		if (draft.status !== task.status) planner.moveTask(task.id, draft.status, draft.assigneeId);
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => {
			if (!open) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-3xl p-5 sm:max-w-lg sm:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "pr-8 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit card" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Assign it, give it a date, or move it to another lane." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Task",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: draft.title,
							onChange: (event) => setDraft({
								...draft,
								title: event.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							rows: 3,
							value: draft.notes,
							onChange: (event) => setDraft({
								...draft,
								notes: event.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "List",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "form-control",
								value: draft.listId,
								onChange: (event) => setDraft({
									...draft,
									listId: event.target.value
								}),
								children: planner.lists.map((list) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: list.id,
									children: list.name
								}, list.id))
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Lane",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "form-control",
								value: draft.status,
								onChange: (event) => {
									const status = event.target.value;
									setDraft({
										...draft,
										status,
										assigneeId: status === "assigned" && !draft.assigneeId ? planner.people[0].id : status === "open" ? null : draft.assigneeId
									});
								},
								children: LANES.map((lane) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: lane.status,
									children: lane.label
								}, lane.status))
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Assigned to",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "form-control",
								value: draft.assigneeId ?? "",
								onChange: (event) => setDraft({
									...draft,
									assigneeId: event.target.value || null,
									status: event.target.value ? draft.status === "done" ? "done" : "assigned" : draft.status === "done" ? "done" : "open"
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "No one yet"
								}), planner.people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: person.id,
									children: person.name
								}, person.id))]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Due date",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								type: "date",
								value: inputDate(draft.dueAt),
								onChange: (event) => {
									const dueAt = event.target.value ? (/* @__PURE__ */ new Date(`${event.target.value}T12:00:00`)).toISOString() : null;
									setDraft({
										...draft,
										dueAt,
										showOnCalendar: dueAt ? draft.showOnCalendar || !draft.dueAt : false
									});
								}
							})
						})]
					}),
					draft.dueAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-bold",
							children: "Show on calendar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs text-muted-foreground",
							children: "Dated cards are shown by default"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: draft.showOnCalendar,
							onChange: (showOnCalendar) => setDraft({
								...draft,
								showOnCalendar
							})
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						disabled: !draft.title.trim(),
						onClick: save,
						children: "Save changes"
					})
				]
			})]
		})
	});
}
//#endregion
export { ListsPage as component };
