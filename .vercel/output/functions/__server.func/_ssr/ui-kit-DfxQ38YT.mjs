import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-kit-DfxQ38YT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var browserClient;
function requiredEnv(name) {
	const value = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_VjuunlynI2m5x0KTtvmTAQ_d-DoNEPQ",
		"VITE_SUPABASE_URL": "https://weewevwhgxfhlvwwnzqj.supabase.co"
	}[name];
	if (!value) throw new Error(`${name} is not configured.`);
	return value;
}
/**
* Returns the browser Supabase client. The publishable key is intentionally
* public; access to family data is enforced by Postgres Row Level Security.
*/
function getSupabaseBrowserClient() {
	if (typeof window === "undefined") throw new Error("The browser Supabase client cannot be used during server rendering.");
	browserClient ??= createClient(requiredEnv("VITE_SUPABASE_URL"), requiredEnv("VITE_SUPABASE_PUBLISHABLE_KEY"), { auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true
	} });
	return browserClient;
}
var AuthContext = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [family, setFamily] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const loadWorkspace = (0, import_react.useCallback)(async (nextSession) => {
		setSession(nextSession);
		setError(null);
		if (!nextSession) {
			setProfile(null);
			setFamily(null);
			setLoading(false);
			return;
		}
		const supabase = getSupabaseBrowserClient();
		const [profileResult, membershipResult] = await Promise.all([supabase.from("profiles").select("*").eq("id", nextSession.user.id).maybeSingle(), supabase.from("family_members").select("family_id, role").eq("user_id", nextSession.user.id).limit(1).maybeSingle()]);
		if (profileResult.error) throw profileResult.error;
		if (membershipResult.error) throw membershipResult.error;
		setProfile(profileResult.data);
		if (!membershipResult.data) {
			setFamily(null);
			setLoading(false);
			return;
		}
		const familyResult = await supabase.from("families").select("id, name").eq("id", membershipResult.data.family_id).single();
		if (familyResult.error) throw familyResult.error;
		setFamily({
			...familyResult.data,
			role: membershipResult.data.role
		});
		setLoading(false);
	}, []);
	const refreshWorkspace = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const { data, error: sessionError } = await getSupabaseBrowserClient().auth.getSession();
			if (sessionError) throw sessionError;
			await loadWorkspace(data.session);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Mesa could not load your family.");
			setLoading(false);
		}
	}, [loadWorkspace]);
	(0, import_react.useEffect)(() => {
		refreshWorkspace();
		const { data: { subscription } } = getSupabaseBrowserClient().auth.onAuthStateChange((_event, nextSession) => {
			loadWorkspace(nextSession).catch((caught) => {
				setError(caught instanceof Error ? caught.message : "Mesa could not load your account.");
				setLoading(false);
			});
		});
		return () => subscription.unsubscribe();
	}, [loadWorkspace, refreshWorkspace]);
	const value = (0, import_react.useMemo)(() => ({
		session,
		user: session?.user ?? null,
		profile,
		family,
		loading,
		error,
		sendMagicLink: async (email, redirectTo) => {
			setError(null);
			const { error: signInError } = await getSupabaseBrowserClient().auth.signInWithOtp({
				email: email.trim(),
				options: {
					shouldCreateUser: true,
					emailRedirectTo: redirectTo ?? window.location.origin
				}
			});
			if (signInError) throw signInError;
		},
		createFamily: async (name) => {
			if (!session?.user) throw new Error("Sign in before creating a family.");
			setError(null);
			const { error: insertError } = await getSupabaseBrowserClient().from("families").insert({
				name: name.trim() || "Our family",
				created_by: session.user.id
			});
			if (insertError) throw insertError;
			await refreshWorkspace();
		},
		signOut: async () => {
			const { error: signOutError } = await getSupabaseBrowserClient().auth.signOut();
			if (signOutError) throw signOutError;
		},
		refreshWorkspace
	}), [
		error,
		family,
		loading,
		profile,
		refreshWorkspace,
		session
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const value = (0, import_react.useContext)(AuthContext);
	if (!value) throw new Error("useAuth must be used within AuthProvider");
	return value;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var variants = {
	primary: "bg-primary text-primary-foreground hover:opacity-90",
	secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
	ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
	danger: "bg-destructive/10 text-destructive hover:bg-destructive/20"
};
function Button({ variant = "primary", className, size = "md", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn("btn-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:opacity-50 disabled:cursor-not-allowed", variants[variant], size === "sm" && "px-3 py-1.5 text-[0.8rem]", size === "lg" && "px-6 py-3.5 text-base w-full", className),
		...props
	});
}
function Card({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("surface p-5", className),
		children
	});
}
function SectionTitle({ title, subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold",
			children: title
		}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-0.5",
			children: subtitle
		}) : null]
	});
}
function Chip({ children, tone = "muted", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold", {
			muted: "bg-secondary text-secondary-foreground",
			adults: "bg-adults-soft text-adults",
			kids: "bg-kids-soft text-kids",
			shared: "bg-shared-soft text-shared"
		}[tone], className),
		children
	});
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-xs text-muted-foreground mt-0.5",
				children: hint
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children
			})
		]
	});
}
function TextInput({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("w-full min-h-11 rounded-xl border border-border bg-card px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/15", className),
		...props
	});
}
function TextArea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("w-full min-h-11 rounded-xl border border-border bg-card px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/15 resize-none", className),
		...props
	});
}
function OptionRow({ options, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(o.value),
			className: cn("btn-base border text-[0.82rem]", value === o.value ? "bg-primary text-primary-foreground border-transparent" : "bg-card border-border text-muted-foreground hover:text-foreground"),
			children: o.label
		}, String(o.value)))
	});
}
function Toggle({ checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		onClick: () => onChange(!checked),
		className: cn("relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20", checked ? "bg-primary" : "bg-border"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 h-6 w-6 rounded-full bg-card shadow-sm transition-all", checked ? "left-[1.4rem]" : "left-0.5") })
	});
}
function EmptyState({ title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "text-center py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1.5 mx-auto max-w-sm",
				children: body
			}),
			action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex justify-center",
				children: action
			}) : null
		]
	});
}
//#endregion
export { EmptyState as a, SectionTitle as c, Toggle as d, cn as f, Chip as i, TextArea as l, useAuth as m, Button as n, Field as o, getSupabaseBrowserClient as p, Card as r, OptionRow as s, AuthProvider as t, TextInput as u };
