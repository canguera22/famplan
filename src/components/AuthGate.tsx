import { FormEvent, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ArrowRight, Check, LoaderCircle, Mail, ShieldCheck, Users } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button, Card, Field, TextInput } from "@/components/ui-kit";
import { useAuth } from "@/lib/auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (auth.loading) return <LoadingScreen />;
  if (pathname === "/join") return children;
  if (!auth.session) return <SignInScreen />;
  if (!auth.family) return <FamilySetupScreen />;
  return children;
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <BrandLogo
        className="h-12 w-12 rounded-2xl bg-white/95 p-1 shadow-lg shadow-black/10"
        priority
      />
      <span>
        <span className="block font-display text-xl font-bold tracking-tight">Mesa</span>
        <span className="block text-xs text-muted-foreground">Family life, together.</span>
      </span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5">
      <div className="text-center" role="status">
        <span className="relative mx-auto grid h-16 w-16 place-items-center">
          <BrandLogo className="h-16 w-16" priority />
          <LoaderCircle className="absolute -bottom-1 -right-1 h-6 w-6 animate-spin rounded-full bg-background p-1 text-primary shadow-sm" />
        </span>
        <p className="mt-4 text-sm font-semibold">Opening your family space…</p>
      </div>
    </main>
  );
}

function SignInScreen() {
  const { sendMagicLink, error: accountError } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
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

  return (
    <main className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.8fr)]">
      <section className="hidden overflow-hidden bg-primary px-12 py-10 text-primary-foreground lg:flex lg:flex-col">
        <Brand />
        <div className="my-auto max-w-xl py-16">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground/65">
            One calm family workspace
          </p>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.08] tracking-tight">
            The week makes more sense when everyone can see it.
          </h1>
          <div className="mt-10 grid gap-4 text-sm text-primary-foreground/80 sm:grid-cols-2">
            {[
              "Shared family calendar",
              "Clear task ownership",
              "Meals and groceries",
              "Private by default",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          <p className="text-sm font-bold text-primary">Welcome to Mesa</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Sign in to your family
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No password to remember. We’ll email you a secure sign-in link.
          </p>

          {sent ? (
            <Card className="mt-8 border-primary/20 bg-person-blue">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-card text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-lg font-bold">Check your inbox</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                We sent a sign-in link to <strong className="text-foreground">{email}</strong>. Open
                it on this device to continue.
              </p>
              <Button variant="ghost" className="mt-4 px-0" onClick={() => setSent(false)}>
                Use a different email
              </Button>
            </Card>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={submit}>
              <Field label="Email address">
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
              {error || accountError ? (
                <p
                  className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {error || accountError}
                </p>
              ) : null}
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

          <p className="mt-8 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Your household data is protected by family membership and Supabase row-level security.
          </p>
        </div>
      </section>
    </main>
  );
}

function FamilySetupScreen() {
  const { createFamily, profile, user, error: accountError } = useAuth();
  const firstName = profile?.display_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const [name, setName] = useState("Our family");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
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

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-10">
      <div className="w-full max-w-lg">
        <Brand />
        <Card className="mt-10 p-6 sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-person-green text-secondary-foreground">
            <Users className="h-6 w-6" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Welcome, {firstName}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Name your shared space. Mesa will create your starter task boards automatically.
          </p>
          {accountError ? (
            <p
              className="mt-5 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              We couldn’t complete your family invitation: {accountError}
            </p>
          ) : null}
          <form className="mt-7 space-y-5" onSubmit={submit}>
            <Field label="Family space name" hint="You can change this later.">
              <TextInput
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="The Anguera family"
                maxLength={80}
                required
              />
            </Field>
            {error ? (
              <p
                className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
              Create family space <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
