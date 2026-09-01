import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Copy,
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
            <ConnectionCard
              icon={MessageCircleMore}
              title="WhatsApp"
              body="Add tasks and ask about the family week through a dedicated number."
              action="Join waitlist"
            />
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
    return `${window.location.origin}/join?token=${token}`;
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
