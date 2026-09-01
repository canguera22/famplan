import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { m as useAuth, n as Button, o as Field, r as Card, t as AuthProvider, u as TextInput } from "./ui-kit-DfxQ38YT.mjs";
import { t as FamilyPlannerProvider } from "./family-store-Qtb0DRS7.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Mail, T as LoaderCircle, W as ArrowRight, h as ShieldCheck, r as Users, z as Check } from "../_libs/lucide-react.mjs";
import { o as StoreProvider } from "./store-C31UwfQs.mjs";
import { t as Route$14 } from "./join-BPw7xnRF.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DvdTknhC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-C5slZyeE.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
function AuthGate({ children }) {
	const auth = useAuth();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	if (auth.loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingScreen, {});
	if (pathname === "/join") return children;
	if (!auth.session) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInScreen, {});
	if (!auth.family) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FamilySetupScreen, {});
	return children;
}
function Brand() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid h-11 w-11 place-items-center rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/15",
			children: "M"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block font-display text-xl font-bold tracking-tight",
			children: "Mesa"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-xs text-muted-foreground",
			children: "Family life, together."
		})] })]
	});
}
function LoadingScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			role: "status",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-primary text-primary-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm font-semibold",
				children: "Opening your family space…"
			})]
		})
	});
}
function SignInScreen() {
	const { sendMagicLink, error: accountError } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [sent, setSent] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function submit(event) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await sendMagicLink(email);
			setSent(true);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "We could not send the sign-in email.");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.8fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "hidden overflow-hidden bg-primary px-12 py-10 text-primary-foreground lg:flex lg:flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "my-auto max-w-xl py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground/65",
						children: "One calm family workspace"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-5 font-display text-5xl font-bold leading-[1.08] tracking-tight",
						children: "The week makes more sense when everyone can see it."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10 grid gap-4 text-sm text-primary-foreground/80 sm:grid-cols-2",
						children: [
							"Shared family calendar",
							"Clear task ownership",
							"Meals and groceries",
							"Private by default"
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }),
								" ",
								item
							]
						}, item))
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-10 lg:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold text-primary",
						children: "Welcome to Mesa"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-3xl font-bold tracking-tight sm:text-4xl",
						children: "Sign in to your family"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-6 text-muted-foreground",
						children: "No password to remember. We’ll email you a secure sign-in link."
					}),
					sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "mt-8 border-primary/20 bg-person-blue",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-11 w-11 place-items-center rounded-2xl bg-card text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-5 text-lg font-bold",
								children: "Check your inbox"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm leading-6 text-muted-foreground",
								children: [
									"We sent a sign-in link to ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: email
									}),
									". Open it on this device to continue."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								className: "mt-4 px-0",
								onClick: () => setSent(false),
								children: "Use a different email"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-8 space-y-5",
						onSubmit: submit,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Email address",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "email",
									autoComplete: "email",
									inputMode: "email",
									placeholder: "you@example.com",
									value: email,
									onChange: (event) => setEmail(event.target.value),
									required: true
								})
							}),
							error || accountError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive",
								role: "alert",
								children: error || accountError
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								size: "lg",
								disabled: submitting,
								children: [submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-5 w-5" }), "Email me a sign-in link"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-8 flex items-start gap-2 text-xs leading-5 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 h-4 w-4 shrink-0" }), "Your household data is protected by family membership and Supabase row-level security."]
					})
				]
			})
		})]
	});
}
function FamilySetupScreen() {
	const { createFamily, profile, user } = useAuth();
	const firstName = profile?.display_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
	const [name, setName] = (0, import_react.useState)("Our family");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function submit(event) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await createFamily(name);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "We could not create your family.");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background px-5 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-10 p-6 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-12 w-12 place-items-center rounded-2xl bg-person-green text-secondary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-6 text-2xl font-bold tracking-tight",
						children: ["Welcome, ", firstName]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted-foreground",
						children: "Name your shared space. Mesa will create your starter task boards automatically."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-7 space-y-5",
						onSubmit: submit,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Family space name",
								hint: "You can change this later.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: name,
									onChange: (event) => setName(event.target.value),
									placeholder: "The Anguera family",
									maxLength: 80,
									required: true
								})
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive",
								role: "alert",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								size: "lg",
								disabled: submitting,
								children: [
									submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : null,
									"Create family space ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-5 w-5" })
								]
							})
						]
					})
				]
			})]
		})
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$13 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Mesa — Your family week, in one place" },
			{
				name: "description",
				content: "A shared family calendar, simple task boards, meal planning and grocery lists in one calm place."
			},
			{
				property: "og:title",
				content: "Mesa — Your family week, in one place"
			},
			{
				property: "og:description",
				content: "Calendar, tasks, meals and lists for busy families."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$13.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FamilyPlannerProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }) }) })
	});
}
var $$splitComponentImporter$12 = () => import("./routes-bN5Uk7ok.mjs");
var Route$12 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Today — Mesa Family Planner" }, {
		name: "description",
		content: "Everything your family needs today, in one calm view."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./calendar-CuVKoJXo.mjs");
var Route$11 = createFileRoute("/calendar")({
	head: () => ({ meta: [{ title: "Calendar — Mesa Family Planner" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./history-ZfskFpvr.mjs");
var Route$10 = createFileRoute("/history")({
	head: () => ({ meta: [
		{ title: "Meal history — Mesa" },
		{
			name: "description",
			content: "What your household has eaten, how often, and separate adult and kids ratings that shape future plans."
		},
		{
			property: "og:title",
			content: "Meal history — Mesa"
		},
		{
			property: "og:description",
			content: "Track served meals and rate them separately for adults and kids."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./index 2-CAkK6pJQ.mjs");
var Route$9 = createFileRoute("/index 2")({
	head: () => ({ meta: [
		{ title: "This Week — Mesa Weekly Dinner Planner" },
		{
			name: "description",
			content: "Plan a week of adult and kids dinners in one tap, review each day, and turn it into a single consolidated grocery basket."
		},
		{
			property: "og:title",
			content: "This Week — Mesa Weekly Dinner Planner"
		},
		{
			property: "og:description",
			content: "Weekly family dinner planning with shared ingredients and one grocery list."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./lists-BpMS7Paq.mjs");
var Route$8 = createFileRoute("/lists")({
	head: () => ({ meta: [{ title: "Lists — Mesa Family Planner" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./meals-BJRtr6pG.mjs");
var Route$7 = createFileRoute("/meals")({
	head: () => ({ meta: [{ title: "Meals — Mesa Family Planner" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./preferences-Dk1MyrjI.mjs");
var Route$6 = createFileRoute("/preferences")({
	head: () => ({ meta: [
		{ title: "Household preferences — Mesa" },
		{
			name: "description",
			content: "Tell the planner what your adults and kids like, dislike and are learning to eat, plus budget and ingredient-reuse priorities."
		},
		{
			property: "og:title",
			content: "Household preferences — Mesa"
		},
		{
			property: "og:description",
			content: "Tastes, restrictions, budget and reuse priorities for your household."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./settings-BTi7fYbV.mjs");
var Route$5 = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Settings — Mesa Family Planner" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./shopping-C-0dfRTu.mjs");
var Route$4 = createFileRoute("/shopping")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./staples-B07zDU-G.mjs");
var Route$3 = createFileRoute("/staples")({
	head: () => ({ meta: [
		{ title: "Household staples — Mesa" },
		{
			name: "description",
			content: "Recurring household items like milk, bread and coffee that are added to every weekly basket automatically."
		},
		{
			property: "og:title",
			content: "Household staples — Mesa"
		},
		{
			property: "og:description",
			content: "Define the recurring items your household always needs."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./shopping.index-X09oEfI2.mjs");
var Route$2 = createFileRoute("/shopping/")({
	head: () => ({ meta: [
		{ title: "Shopping list — Mesa" },
		{
			name: "description",
			content: "One consolidated grocery basket: duplicate ingredients merged, quantities summed and rounded to real package sizes."
		},
		{
			property: "og:title",
			content: "Shopping list — Mesa"
		},
		{
			property: "og:description",
			content: "Consolidated weekly grocery basket built from your approved dinners and staples."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./shopping.mercadona-BQVGunmW.mjs");
var Route$1 = createFileRoute("/shopping/mercadona")({
	head: () => ({ meta: [
		{ title: "Your Mercadona Basket — Mesa" },
		{
			name: "description",
			content: "Review the exact Mercadona products matched to your weekly ingredients, swap any of them, then add the approved basket to your Mercadona cart."
		},
		{
			property: "og:title",
			content: "Your Mercadona Basket — Mesa"
		},
		{
			property: "og:description",
			content: "Every ingredient matched to a real product with package sizes and quantities. You always review before anything is added."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./shopping.review-B7eaxrHP.mjs");
var Route = createFileRoute("/shopping/review")({
	head: () => ({ meta: [
		{ title: "Final basket review — Mesa" },
		{
			name: "description",
			content: "Final review of the approved grocery basket before it is sent to a retailer cart."
		},
		{
			property: "og:title",
			content: "Final basket review — Mesa"
		},
		{
			property: "og:description",
			content: "Confirm your weekly basket. Checkout always stays in your hands."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$12.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$13
});
var CalendarRoute = Route$11.update({
	id: "/calendar",
	path: "/calendar",
	getParentRoute: () => Route$13
});
var HistoryRoute = Route$10.update({
	id: "/history",
	path: "/history",
	getParentRoute: () => Route$13
});
var Index2Route = Route$9.update({
	id: "/index 2",
	path: "/index 2",
	getParentRoute: () => Route$13
});
var JoinRoute = Route$14.update({
	id: "/join",
	path: "/join",
	getParentRoute: () => Route$13
});
var ListsRoute = Route$8.update({
	id: "/lists",
	path: "/lists",
	getParentRoute: () => Route$13
});
var MealsRoute = Route$7.update({
	id: "/meals",
	path: "/meals",
	getParentRoute: () => Route$13
});
var PreferencesRoute = Route$6.update({
	id: "/preferences",
	path: "/preferences",
	getParentRoute: () => Route$13
});
var SettingsRoute = Route$5.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$13
});
var ShoppingRoute = Route$4.update({
	id: "/shopping",
	path: "/shopping",
	getParentRoute: () => Route$13
});
var StaplesRoute = Route$3.update({
	id: "/staples",
	path: "/staples",
	getParentRoute: () => Route$13
});
var ShoppingIndexRoute = Route$2.update({
	id: "/",
	path: "/",
	getParentRoute: () => ShoppingRoute
});
var ShoppingRouteChildren = {
	ShoppingMercadonaRoute: Route$1.update({
		id: "/mercadona",
		path: "/mercadona",
		getParentRoute: () => ShoppingRoute
	}),
	ShoppingReviewRoute: Route.update({
		id: "/review",
		path: "/review",
		getParentRoute: () => ShoppingRoute
	}),
	ShoppingIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	CalendarRoute,
	HistoryRoute,
	Index2Route,
	JoinRoute,
	ListsRoute,
	MealsRoute,
	PreferencesRoute,
	SettingsRoute,
	ShoppingRoute: ShoppingRoute._addFileChildren(ShoppingRouteChildren),
	StaplesRoute
};
var routeTree = Route$13._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
