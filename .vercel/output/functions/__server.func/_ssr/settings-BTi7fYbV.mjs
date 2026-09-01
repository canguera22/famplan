import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as Toggle, m as useAuth, n as Button, o as Field, p as getSupabaseBrowserClient, r as Card, u as TextInput } from "./ui-kit-DfxQ38YT.mjs";
import { r as useFamilyPlanner } from "./family-store-Qtb0DRS7.mjs";
import { A as Copy, F as ChevronRight, S as MessageCircleMore, U as Bell, V as CalendarDays, a as UserPlus, h as ShieldCheck, t as X, w as LogOut, z as Check } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BTi7fYbV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const planner = useFamilyPlanner();
	const { family, profile, user, signOut } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Settings",
		subtitle: "People, notifications and the services Mesa can talk to.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "account-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "account-title",
							className: "text-lg font-bold",
							children: "Account"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-sm text-muted-foreground",
							children: "Your Mesa identity and family space."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-11 w-11 place-items-center rounded-full bg-person-blue text-sm font-bold text-primary",
								children: (profile?.display_name || user?.email || "F").slice(0, 1).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-semibold",
									children: profile?.display_name || "Family member"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: user?.email
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-xl bg-muted px-3 py-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Family space:"
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: family?.name
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "mt-4",
							onClick: () => void signOut(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Sign out"]
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "people-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "people-title",
							className: "text-lg font-bold",
							children: "People"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-sm text-muted-foreground",
							children: "People who can be assigned tasks and events."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "overflow-hidden p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "divide-y divide-border",
							children: planner.people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-h-16 items-center gap-3 px-4 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid h-10 w-10 place-items-center rounded-full bg-muted text-sm font-bold",
										children: person.shortName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: person.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: person.id.startsWith("child") ? "Assignable profile" : "Family account"
										})]
									}),
									!person.id.startsWith("child") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-xs font-bold text-secondary-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), "Active"]
									}) : null
								]
							}, person.id))
						})
					})]
				}),
				family?.role === "owner" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FamilyInvitations, {
					familyId: family.id,
					userId: user.id
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "connections-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "connections-title",
							className: "text-lg font-bold",
							children: "Connections"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-sm text-muted-foreground",
							children: "Bring Mesa into the tools your family already opens."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionCard, {
							icon: CalendarDays,
							title: "Google Calendar",
							body: "Two-way sync with a dedicated Mesa Family calendar.",
							action: "Connect Google"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionCard, {
							icon: MessageCircleMore,
							title: "WhatsApp",
							body: "Add tasks and ask about the family week through a dedicated number.",
							action: "Join waitlist"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "notifications-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "notifications-title",
							className: "text-lg font-bold",
							children: "Notifications"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-sm text-muted-foreground",
							children: "Useful prompts without constant noise."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "divide-y divide-border p-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingToggle, {
							icon: Bell,
							title: "Morning family brief",
							body: "A short look at today at 07:30.",
							defaultChecked: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingToggle, {
							icon: CalendarDays,
							title: "Task reminders",
							body: "Remind the assignee on the due date.",
							defaultChecked: true
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "privacy-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "privacy-title",
							className: "text-lg font-bold",
							children: "Privacy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-sm text-muted-foreground",
							children: "Your family plan stays private by default."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-person-green text-secondary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: "Protected family workspace"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-6 text-muted-foreground",
							children: "Database access is limited by family membership. Connection credentials remain server-only."
						})] })]
					})]
				})
			]
		})
	});
}
function FamilyInvitations({ familyId, userId }) {
	const [email, setEmail] = (0, import_react.useState)("");
	const [invitations, setInvitations] = (0, import_react.useState)([]);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getSupabaseBrowserClient().from("family_invitations").select("id, email, token, expires_at").eq("family_id", familyId).eq("status", "pending").gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", { ascending: false }).then(({ data, error: loadError }) => {
			if (loadError) setError(loadError.message);
			else setInvitations(data ?? []);
		});
	}, [familyId]);
	function invitationLink(token) {
		return `${window.location.origin}/join?token=${token}`;
	}
	async function createInvitation(event) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		const normalizedEmail = email.trim().toLowerCase();
		try {
			const supabase = getSupabaseBrowserClient();
			const { data, error: insertError } = await supabase.from("family_invitations").insert({
				family_id: familyId,
				email: normalizedEmail,
				invited_by: userId
			}).select("id, email, token, expires_at").single();
			if (insertError?.code === "23505") {
				const { data: existing, error: existingError } = await supabase.from("family_invitations").select("id, email, token, expires_at").eq("family_id", familyId).eq("status", "pending").ilike("email", normalizedEmail).single();
				if (existingError) throw existingError;
				setInvitations((current) => [existing, ...current.filter((item) => item.id !== existing.id)]);
			} else {
				if (insertError) throw insertError;
				setInvitations((current) => [data, ...current]);
			}
			setEmail("");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Mesa could not create the invitation.");
		} finally {
			setSubmitting(false);
		}
	}
	async function copyInvitation(invitation) {
		await navigator.clipboard.writeText(invitationLink(invitation.token));
		setCopied(invitation.id);
		window.setTimeout(() => setCopied(null), 2e3);
	}
	async function revokeInvitation(invitationId) {
		const { error: revokeError } = await getSupabaseBrowserClient().from("family_invitations").update({ status: "revoked" }).eq("id", invitationId);
		if (revokeError) {
			setError(revokeError.message);
			return;
		}
		setInvitations((current) => current.filter((invitation) => invitation.id !== invitationId));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "invitations-title",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "invitations-title",
				className: "text-lg font-bold",
				children: "Invite an adult"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-sm text-muted-foreground",
				children: "Create a secure link for your partner to join this family space."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end",
				onSubmit: createInvitation,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Their email address",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "email",
							inputMode: "email",
							autoComplete: "email",
							placeholder: "partner@example.com",
							value: email,
							onChange: (event) => setEmail(event.target.value),
							required: true
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					className: "min-h-11",
					disabled: submitting,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4" }), " Create invite"]
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive",
				role: "alert",
				children: error
			}) : null,
			invitations.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 divide-y divide-border border-t border-border",
				children: invitations.map((invitation) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-semibold",
								children: invitation.email
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Expires",
									" ",
									new Intl.DateTimeFormat("en", {
										month: "short",
										day: "numeric"
									}).format(new Date(invitation.expires_at))
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: () => void copyInvitation(invitation),
							children: [copied === invitation.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" }), copied === invitation.id ? "Copied" : "Copy link"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							"aria-label": `Revoke invitation for ${invitation.email}`,
							onClick: () => void revokeInvitation(invitation.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})
					]
				}, invitation.id))
			}) : null
		] })]
	});
}
function ConnectionCard({ icon: Icon, title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "flex items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-person-blue text-primary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-6 text-muted-foreground",
					children: body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					size: "sm",
					className: "mt-3",
					disabled: true,
					title: "Integration setup is the next implementation step",
					children: [action, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })]
				})
			]
		})]
	});
}
function SettingToggle({ icon: Icon, title, body, defaultChecked }) {
	const [checked, setChecked] = (0, import_react.useState)(defaultChecked);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-h-20 items-center gap-3 px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5 shrink-0 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-0.5 block text-xs leading-5 text-muted-foreground",
					children: body
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				checked,
				onChange: setChecked
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
