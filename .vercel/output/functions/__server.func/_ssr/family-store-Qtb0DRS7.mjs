import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { m as useAuth, p as getSupabaseBrowserClient } from "./ui-kit-DfxQ38YT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/family-store-Qtb0DRS7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_STATE = {
	people: [],
	lists: [],
	tasks: [],
	events: []
};
var FamilyPlannerContext = (0, import_react.createContext)(null);
var PERSON_COLORS = [
	"blue",
	"green",
	"amber",
	"violet"
];
function personFromRow(row, index) {
	const savedColor = row.color;
	return {
		id: row.id,
		name: row.display_name,
		shortName: row.display_name.slice(0, 1).toUpperCase(),
		color: PERSON_COLORS.includes(savedColor) ? savedColor : PERSON_COLORS[index % PERSON_COLORS.length]
	};
}
function listFromRow(row) {
	const color = row.color === "amber" ? "amber" : row.color === "green" ? "green" : "blue";
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		color
	};
}
function taskFromRow(row) {
	return {
		id: row.id,
		listId: row.list_id,
		title: row.title,
		notes: row.notes,
		status: row.status,
		priority: row.priority,
		assigneeId: row.assignee_id,
		dueAt: row.due_at,
		allDay: row.all_day,
		showOnCalendar: row.show_on_calendar,
		completedAt: row.completed_at
	};
}
function eventFromRow(row) {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		startsAt: row.starts_at,
		endsAt: row.ends_at,
		allDay: row.all_day,
		assigneeId: row.assignee_id,
		source: row.source_type === "meal" ? "meal" : "manual"
	};
}
function reportSyncError(action, error) {
	console.error(`Supabase ${action} failed`, error);
}
function FamilyPlannerProvider({ children }) {
	const { family, user } = useAuth();
	const [state, setState] = (0, import_react.useState)(EMPTY_STATE);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const loadFamily = (0, import_react.useCallback)(async () => {
		if (!family) {
			setState(EMPTY_STATE);
			setHydrated(true);
			return;
		}
		const supabase = getSupabaseBrowserClient();
		const [peopleResult, listsResult, tasksResult, eventsResult] = await Promise.all([
			supabase.from("people").select("*").eq("family_id", family.id).eq("active", true).order("created_at"),
			supabase.from("lists").select("*").eq("family_id", family.id).is("archived_at", null).order("position"),
			supabase.from("list_cards").select("*").eq("family_id", family.id).order("position"),
			supabase.from("calendar_events").select("*").eq("family_id", family.id).order("starts_at")
		]);
		const firstError = peopleResult.error || listsResult.error || tasksResult.error || eventsResult.error;
		if (firstError) throw firstError;
		setState({
			people: (peopleResult.data ?? []).map(personFromRow),
			lists: (listsResult.data ?? []).map(listFromRow),
			tasks: (tasksResult.data ?? []).map(taskFromRow),
			events: (eventsResult.data ?? []).map(eventFromRow)
		});
		setHydrated(true);
	}, [family]);
	(0, import_react.useEffect)(() => {
		setHydrated(false);
		loadFamily().catch((error) => {
			reportSyncError("initial load", error);
			setHydrated(true);
		});
		if (!family) return;
		const supabase = getSupabaseBrowserClient();
		const refresh = () => void loadFamily().catch((error) => reportSyncError("realtime refresh", error));
		const channel = supabase.channel(`family:${family.id}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "people",
			filter: `family_id=eq.${family.id}`
		}, refresh).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "lists",
			filter: `family_id=eq.${family.id}`
		}, refresh).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "list_cards",
			filter: `family_id=eq.${family.id}`
		}, refresh).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "calendar_events",
			filter: `family_id=eq.${family.id}`
		}, refresh).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [family, loadFamily]);
	const value = (0, import_react.useMemo)(() => ({
		...state,
		hydrated,
		addTask: (input) => {
			if (!family || !user) throw new Error("Your family workspace is not ready.");
			const id = crypto.randomUUID();
			const assigneeId = input.assigneeId ?? null;
			const dueAt = input.dueAt ?? null;
			const task = {
				id,
				listId: input.listId ?? state.lists[0]?.id ?? "",
				title: input.title,
				notes: input.notes ?? "",
				status: assigneeId ? "assigned" : "open",
				priority: input.priority ?? "normal",
				assigneeId,
				dueAt,
				allDay: input.allDay ?? true,
				showOnCalendar: dueAt ? input.showOnCalendar ?? true : false,
				completedAt: null
			};
			setState((current) => ({
				...current,
				tasks: [task, ...current.tasks]
			}));
			getSupabaseBrowserClient().from("list_cards").insert({
				id,
				family_id: family.id,
				list_id: task.listId,
				title: task.title,
				notes: task.notes,
				status: task.status,
				assignee_id: task.assigneeId,
				due_at: task.dueAt,
				all_day: task.allDay,
				show_on_calendar: task.showOnCalendar,
				priority: task.priority,
				created_by: user.id
			}).then(({ error }) => {
				if (error) {
					reportSyncError("task insert", error);
					setState((current) => ({
						...current,
						tasks: current.tasks.filter((item) => item.id !== id)
					}));
				}
			});
			return id;
		},
		updateTask: (taskId, patch) => {
			const current = state.tasks.find((task) => task.id === taskId);
			if (!current) return;
			const next = {
				...current,
				...patch
			};
			if (!next.dueAt) next.showOnCalendar = false;
			if (patch.assigneeId !== void 0 && next.status !== "done") next.status = patch.assigneeId ? "assigned" : "open";
			setState((value) => ({
				...value,
				tasks: value.tasks.map((task) => task.id === taskId ? next : task)
			}));
			getSupabaseBrowserClient().from("list_cards").update({
				list_id: next.listId,
				title: next.title,
				notes: next.notes,
				status: next.status,
				priority: next.priority,
				assignee_id: next.assigneeId,
				due_at: next.dueAt,
				all_day: next.allDay,
				show_on_calendar: next.showOnCalendar,
				completed_at: next.completedAt
			}).eq("id", taskId).then(({ error }) => error && reportSyncError("task update", error));
		},
		moveTask: (taskId, status, requestedAssignee) => {
			const current = state.tasks.find((task) => task.id === taskId);
			if (!current) return;
			const next = status === "done" ? {
				...current,
				status,
				completedAt: (/* @__PURE__ */ new Date()).toISOString()
			} : status === "open" ? {
				...current,
				status,
				assigneeId: null,
				completedAt: null
			} : {
				...current,
				status,
				assigneeId: requestedAssignee ?? current.assigneeId ?? state.people[0]?.id ?? null,
				completedAt: null
			};
			if (status === "assigned" && !next.assigneeId) return;
			setState((value) => ({
				...value,
				tasks: value.tasks.map((task) => task.id === taskId ? next : task)
			}));
			getSupabaseBrowserClient().from("list_cards").update({
				status: next.status,
				assignee_id: next.assigneeId,
				completed_at: next.completedAt
			}).eq("id", taskId).then(({ error }) => error && reportSyncError("task move", error));
		},
		addEvent: (input) => {
			if (!family || !user) throw new Error("Your family workspace is not ready.");
			const id = crypto.randomUUID();
			const event = {
				id,
				title: input.title,
				description: input.description ?? "",
				startsAt: input.startsAt,
				endsAt: input.endsAt,
				allDay: input.allDay ?? false,
				assigneeId: input.assigneeId ?? null,
				source: "manual"
			};
			setState((current) => ({
				...current,
				events: [...current.events, event]
			}));
			getSupabaseBrowserClient().from("calendar_events").insert({
				id,
				family_id: family.id,
				title: event.title,
				description: event.description,
				starts_at: event.startsAt,
				ends_at: event.endsAt,
				all_day: event.allDay,
				assignee_id: event.assigneeId,
				source_type: "manual",
				created_by: user.id
			}).then(({ error }) => {
				if (error) {
					reportSyncError("event insert", error);
					setState((current) => ({
						...current,
						events: current.events.filter((item) => item.id !== id)
					}));
				}
			});
			return id;
		},
		updateEvent: (eventId, patch) => {
			const current = state.events.find((event) => event.id === eventId);
			if (!current) return;
			const next = {
				...current,
				...patch
			};
			setState((value) => ({
				...value,
				events: value.events.map((event) => event.id === eventId ? next : event)
			}));
			getSupabaseBrowserClient().from("calendar_events").update({
				title: next.title,
				description: next.description,
				starts_at: next.startsAt,
				ends_at: next.endsAt,
				all_day: next.allDay,
				assignee_id: next.assigneeId,
				source_type: next.source
			}).eq("id", eventId).then(({ error }) => error && reportSyncError("event update", error));
		},
		removeEvent: (eventId) => {
			setState((current) => ({
				...current,
				events: current.events.filter((event) => event.id !== eventId)
			}));
			getSupabaseBrowserClient().from("calendar_events").delete().eq("id", eventId).then(({ error }) => error && reportSyncError("event delete", error));
		}
	}), [
		family,
		hydrated,
		state,
		user
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FamilyPlannerContext.Provider, {
		value,
		children
	});
}
function useFamilyPlanner() {
	const value = (0, import_react.useContext)(FamilyPlannerContext);
	if (!value) throw new Error("useFamilyPlanner must be used within FamilyPlannerProvider");
	return value;
}
function personFor(people, id) {
	return id ? people.find((person) => person.id === id) : void 0;
}
//#endregion
export { personFor as n, useFamilyPlanner as r, FamilyPlannerProvider as t };
