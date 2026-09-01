import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { m as useAuth, n as Button, o as Field, p as getSupabaseBrowserClient, r as Card, u as TextInput } from "./ui-kit-DfxQ38YT.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Mail, P as CircleCheck, T as LoaderCircle, W as ArrowRight, h as ShieldCheck, r as Users } from "../_libs/lucide-react.mjs";
import { t as Route } from "./join-BPw7xnRF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/join-BH8Qdnm5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function JoinFamilyPage() {
	const { token } = Route.useSearch();
	const { session, sendMagicLink, refreshWorkspace } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [sent, setSent] = (0, import_react.useState)(false);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const validToken = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
	async function requestLink(event) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			const redirectTo = `${window.location.origin}/join?token=${encodeURIComponent(token)}`;
			await sendMagicLink(email, redirectTo);
			setSent(true);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "We could not send the sign-in link.");
		} finally {
			setSubmitting(false);
		}
	}
	async function acceptInvitation() {
		setSubmitting(true);
		setError(null);
		try {
			const { error: acceptError } = await getSupabaseBrowserClient().rpc("accept_family_invitation", { invitation_token: token });
			if (acceptError) throw acceptError;
			await refreshWorkspace();
			await navigate({ to: "/" });
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "We could not accept this invitation.");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background px-5 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "flex w-fit items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-11 w-11 place-items-center rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground",
					children: "M"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-display text-xl font-bold tracking-tight",
					children: "Mesa"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-xs text-muted-foreground",
					children: "Family life, together."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-10 p-6 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-12 w-12 place-items-center rounded-2xl bg-person-green text-secondary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-6 text-2xl font-bold tracking-tight",
						children: "Join your family space"
					}),
					!validToken ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-6 text-muted-foreground",
							children: "This invitation link is incomplete or invalid. Ask the family owner for a fresh link."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "mt-5",
								children: "Go to Mesa"
							})
						})]
					}) : session ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm leading-6 text-muted-foreground",
								children: [
									"You’re signed in as",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: session.user.email
									}),
									". Accept to share the household calendar, task boards, meals and shopping lists."
								]
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorMessage, { message: error }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "lg",
								className: "mt-6",
								onClick: () => void acceptInvitation(),
								disabled: submitting,
								children: [
									submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5" }),
									"Accept invitation ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-5 w-5" })
								]
							})
						]
					}) : sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl bg-person-blue p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-6 w-6 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-4 font-bold",
								children: "Check your inbox"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm leading-6 text-muted-foreground",
								children: [
									"Open the secure link sent to ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: email
									}),
									" to return here and accept the invitation."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								className: "mt-3 px-0",
								onClick: () => setSent(false),
								children: "Use a different email"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-5 space-y-5",
						onSubmit: requestLink,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-6 text-muted-foreground",
								children: "Sign in with the email address your invitation was sent to."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Invited email address",
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
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorMessage, { message: error }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								size: "lg",
								disabled: submitting,
								children: [submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-5 w-5" }), "Email me a sign-in link"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-7 flex items-start gap-2 text-xs leading-5 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 h-4 w-4 shrink-0" }), "Invitations expire after seven days and can only be accepted by the invited email."]
					})
				]
			})]
		})
	});
}
function ErrorMessage({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive",
		role: "alert",
		children: message
	});
}
//#endregion
export { JoinFamilyPage as component };
