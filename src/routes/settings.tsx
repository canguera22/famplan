import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Copy,
  Link2,
  LoaderCircle,
  MessageCircleMore,
  LogOut,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Field, TextInput, Toggle } from "@/components/ui-kit";
import { useFamilyPlanner } from "@/lib/family-store";
import { useAuth } from "@/lib/auth";
import { publicSiteLink } from "@/lib/site-url";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Mesa Family Planner" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const planner = useFamilyPlanner();
  const { family, profile, user, signOut } = useAuth();
  return (
    <AppShell title="Settings" subtitle="People, notifications and the services Mesa can talk to.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="account-title">
          <div className="mb-3">
            <h2 id="account-title" className="text-lg font-bold">
              Account
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your Mesa identity and family space.
            </p>
          </div>
          <Card>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-person-blue text-sm font-bold text-primary">
                {(profile?.display_name || user?.email || "F").slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{profile?.display_name || "Family member"}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-muted px-3 py-2 text-sm">
              <span className="text-muted-foreground">Family space:</span>{" "}
              <span className="font-semibold">{family?.name}</span>
            </div>
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => void signOut()}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </Card>
        </section>

        <section aria-labelledby="people-title">
          <div className="mb-3">
            <h2 id="people-title" className="text-lg font-bold">
              People
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              People who can be assigned tasks and events.
            </p>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="divide-y divide-border">
              {planner.people.map((person) => (
                <div key={person.id} className="flex min-h-16 items-center gap-3 px-4 py-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-sm font-bold">
                    {person.shortName}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{person.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {person.id.startsWith("child") ? "Assignable profile" : "Family account"}
                    </p>
                  </div>
                  {!person.id.startsWith("child") ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary-foreground">
                      <Check className="h-4 w-4" />
                      Active
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        </section>

        {family?.role === "owner" ? (
          <FamilyInvitations familyId={family.id} userId={user!.id} />
        ) : null}

        <section aria-labelledby="connections-title">
          <div className="mb-3">
            <h2 id="connections-title" className="text-lg font-bold">
              Connections
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Bring Mesa into the tools your family already opens.
            </p>
          </div>
          <div className="space-y-3">
            <ConnectionCard
              icon={CalendarDays}
              title="Google Calendar"
              body="Two-way sync with a dedicated Mesa Family calendar."
              action="Connect Google"
            />
            <WhatsAppConnectionCard familyId={family!.id} people={planner.people} />
          </div>
        </section>

        <section aria-labelledby="notifications-title">
          <div className="mb-3">
            <h2 id="notifications-title" className="text-lg font-bold">
              Notifications
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Useful prompts without constant noise.
            </p>
          </div>
          <Card className="divide-y divide-border p-0">
            <SettingToggle
              icon={Bell}
              title="Morning family brief"
              body="A short look at today at 07:30."
              defaultChecked
            />
            <SettingToggle
              icon={CalendarDays}
              title="Task reminders"
              body="Remind the assignee on the due date."
              defaultChecked
            />
          </Card>
        </section>

        <section aria-labelledby="privacy-title">
          <div className="mb-3">
            <h2 id="privacy-title" className="text-lg font-bold">
              Privacy
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your family plan stays private by default.
            </p>
          </div>
          <Card className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-person-green text-secondary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Protected family workspace</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Database access is limited by family membership. Connection credentials remain
                server-only.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

interface WhatsAppIdentity {
  id: string;
  person_id: string;
  display_phone: string;
  profile_name: string | null;
}

function WhatsAppConnectionCard({
  familyId,
  people,
}: {
  familyId: string;
  people: Array<{ id: string; name: string }>;
}) {
  const [identities, setIdentities] = useState<WhatsAppIdentity[]>([]);
  const [personId, setPersonId] = useState(people[0]?.id ?? "");
  const [pairing, setPairing] = useState<{ code: string; expires_at: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getSupabaseBrowserClient()
      .from("whatsapp_identities")
      .select("id, person_id, display_phone, profile_name")
      .eq("family_id", familyId)
      .eq("active", true)
      .then(({ data, error: loadError }) => {
        if (loadError) setError(loadError.message);
        else setIdentities(data ?? []);
      });
  }, [familyId]);

  useEffect(() => {
    if (!personId && people[0]) setPersonId(people[0].id);
  }, [people, personId]);

  async function createPairingCode() {
    if (!personId) return;
    setLoading(true);
    setError(null);
    setPairing(null);
    const { data, error: pairingError } = await getSupabaseBrowserClient().rpc(
      "create_whatsapp_pairing_code",
      { target_person_id: personId },
    );
    if (pairingError) setError(pairingError.message);
    else setPairing(data?.[0] ?? null);
    setLoading(false);
  }

  async function copyPairingMessage() {
    if (!pairing) return;
    await navigator.clipboard.writeText(`link ${pairing.code}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function disconnect(identity: WhatsAppIdentity) {
    const { error: deleteError } = await getSupabaseBrowserClient()
      .from("whatsapp_identities")
      .delete()
      .eq("id", identity.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setIdentities((current) => current.filter((item) => item.id !== identity.id));
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-person-green text-secondary-foreground">
          <MessageCircleMore className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">WhatsApp</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Add tasks and ask about today from the Twilio sandbox chat.
              </p>
            </div>
            {identities.length ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary-foreground">
                <Check className="h-4 w-4" /> Connected
              </span>
            ) : null}
          </div>

          {identities.length ? (
            <div className="mt-4 space-y-2">
              {identities.map((identity) => {
                const person = people.find((item) => item.id === identity.person_id);
                return (
                  <div
                    key={identity.id}
                    className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {person?.name ?? identity.profile_name ?? "Family member"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        +{identity.display_phone.replace(/^\+/, "")}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Disconnect WhatsApp for ${person?.name ?? "family member"}`}
                      onClick={() => void disconnect(identity)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Connect as</span>
              <select
                value={personId}
                onChange={(event) => setPersonId(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-ring/15"
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => void createPairingCode()}
              disabled={loading || !personId}
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Create link code
            </Button>
          </div>

          {pairing ? (
            <div className="mt-4 rounded-2xl border border-primary/20 bg-person-blue p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                Send this in WhatsApp
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <code className="rounded-xl bg-card px-3 py-2 text-base font-bold">
                  link {pairing.code}
                </code>
                <Button variant="ghost" size="sm" onClick={() => void copyPairingMessage()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                This one-time code expires at{" "}
                {new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(
                  new Date(pairing.expires_at),
                )}
                .
              </p>
            </div>
          ) : null}

          {error ? (
            <p
              className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

interface PendingInvitation {
  id: string;
  email: string;
  token: string;
  expires_at: string;
}

function FamilyInvitations({ familyId, userId }: { familyId: string; userId: string }) {
  const [email, setEmail] = useState("");
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getSupabaseBrowserClient()
      .from("family_invitations")
      .select("id, email, token, expires_at")
      .eq("family_id", familyId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (loadError) setError(loadError.message);
        else setInvitations(data ?? []);
      });
  }, [familyId]);

  function invitationLink(token: string) {
    return publicSiteLink(`/join?token=${token}`);
  }

  async function createInvitation(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: insertError } = await supabase
        .from("family_invitations")
        .insert({ family_id: familyId, email: normalizedEmail, invited_by: userId })
        .select("id, email, token, expires_at")
        .single();

      if (insertError?.code === "23505") {
        const { data: existing, error: existingError } = await supabase
          .from("family_invitations")
          .select("id, email, token, expires_at")
          .eq("family_id", familyId)
          .eq("status", "pending")
          .ilike("email", normalizedEmail)
          .single();
        if (existingError) throw existingError;
        setInvitations((current) => [
          existing,
          ...current.filter((item) => item.id !== existing.id),
        ]);
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

  async function copyInvitation(invitation: PendingInvitation) {
    await navigator.clipboard.writeText(invitationLink(invitation.token));
    setCopied(invitation.id);
    window.setTimeout(() => setCopied(null), 2000);
  }

  async function revokeInvitation(invitationId: string) {
    const { error: revokeError } = await getSupabaseBrowserClient()
      .from("family_invitations")
      .update({ status: "revoked" })
      .eq("id", invitationId);
    if (revokeError) {
      setError(revokeError.message);
      return;
    }
    setInvitations((current) => current.filter((invitation) => invitation.id !== invitationId));
  }

  return (
    <section aria-labelledby="invitations-title">
      <div className="mb-3">
        <h2 id="invitations-title" className="text-lg font-bold">
          Invite an adult
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Create a secure link for your partner to join this family space.
        </p>
      </div>
      <Card>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={createInvitation}>
          <div className="min-w-0 flex-1">
            <Field label="Their email address">
              <TextInput
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="partner@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
          </div>
          <Button type="submit" className="min-h-11" disabled={submitting}>
            <UserPlus className="h-4 w-4" /> Create invite
          </Button>
        </form>
        {error ? (
          <p
            className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {invitations.length ? (
          <div className="mt-5 divide-y divide-border border-t border-border">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Expires{" "}
                    {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
                      new Date(invitation.expires_at),
                    )}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void copyInvitation(invitation)}
                >
                  {copied === invitation.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied === invitation.id ? "Copied" : "Copy link"}
                </Button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Revoke invitation for ${invitation.email}`}
                  onClick={() => void revokeInvitation(invitation.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </section>
  );
}

function ConnectionCard({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof CalendarDays;
  title: string;
  body: string;
  action: string;
}) {
  return (
    <Card className="flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-person-blue text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          disabled
          title="Integration setup is the next implementation step"
        >
          {action}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function SettingToggle({
  icon: Icon,
  title,
  body,
  defaultChecked,
}: {
  icon: typeof Bell;
  title: string;
  body: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="flex min-h-20 items-center gap-3 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{body}</span>
      </span>
      <Toggle checked={checked} onChange={setChecked} />
    </label>
  );
}
