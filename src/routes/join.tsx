import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, Mail, ShieldCheck, Users } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button, Card, Field, TextInput } from "@/components/ui-kit";
import { useAuth } from "@/lib/auth";
import { clearPendingInvitation, rememberPendingInvitation } from "@/lib/invitation-session";
import { publicSiteLink } from "@/lib/site-url";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/join")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Join your family — Mesa" },
      { name: "description", content: "Accept an invitation to a shared Mesa family space." },
    ],
  }),
  component: JoinFamilyPage,
});

function JoinFamilyPage() {
  const { token } = Route.useSearch();
  const { session, sendMagicLink, refreshWorkspace } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validToken =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);

  async function requestLink(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      rememberPendingInvitation(token);
      const redirectTo = publicSiteLink(`/join?token=${encodeURIComponent(token)}`);
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
      const { error: acceptError } = await getSupabaseBrowserClient().rpc(
        "accept_family_invitation",
        { invitation_token: token },
      );
      if (acceptError) throw acceptError;
      clearPendingInvitation();
      await refreshWorkspace();
      await navigate({ to: "/" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not accept this invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-10">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex w-fit items-center gap-3">
          <BrandLogo className="h-12 w-12" priority />
          <span>
            <span className="block font-display text-xl font-bold tracking-tight">Mesa</span>
            <span className="block text-xs text-muted-foreground">Family life, together.</span>
          </span>
        </Link>

        <Card className="mt-10 p-6 sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-person-green text-secondary-foreground">
            <Users className="h-6 w-6" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Join your family space</h1>

          {!validToken ? (
            <div className="mt-4">
              <p className="text-sm leading-6 text-muted-foreground">
                This invitation link is incomplete or invalid. Ask the family owner for a fresh
                link.
              </p>
              <Link to="/">
                <Button variant="secondary" className="mt-5">
                  Go to Mesa
                </Button>
              </Link>
            </div>
          ) : session ? (
            <div className="mt-4">
              <p className="text-sm leading-6 text-muted-foreground">
                You’re signed in as{" "}
                <strong className="text-foreground">{session.user.email}</strong>. Accept to share
                the household calendar, task boards, meals and shopping lists.
              </p>
              {error ? <ErrorMessage message={error} /> : null}
              <Button
                size="lg"
                className="mt-6"
                onClick={() => void acceptInvitation()}
                disabled={submitting}
              >
                {submitting ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
                Accept invitation <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          ) : sent ? (
            <div className="mt-5 rounded-2xl bg-person-blue p-5">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-bold">Check your inbox</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Open the secure link sent to <strong className="text-foreground">{email}</strong> to
                return here and accept the invitation.
              </p>
              <Button variant="ghost" className="mt-3 px-0" onClick={() => setSent(false)}>
                Use a different email
              </Button>
            </div>
          ) : (
            <form className="mt-5 space-y-5" onSubmit={requestLink}>
              <p className="text-sm leading-6 text-muted-foreground">
                Sign in with the email address your invitation was sent to.
              </p>
              <Field label="Invited email address">
                <TextInput
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              {error ? <ErrorMessage message={error} /> : null}
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                Email me a sign-in link
              </Button>
            </form>
          )}

          <p className="mt-7 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Invitations expire after seven days and can only be accepted by the invited email.
          </p>
        </Card>
      </div>
    </main>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p
      className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
}
