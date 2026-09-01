import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Database } from "@/lib/supabase/database.types";
import { clearPendingInvitation, readPendingInvitation } from "@/lib/invitation-session";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicSiteUrl } from "@/lib/site-url";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface FamilySummary {
  id: string;
  name: string;
  role: string;
}

interface AuthValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  family: FamilySummary | null;
  loading: boolean;
  error: string | null;
  sendMagicLink: (email: string, redirectTo?: string) => Promise<void>;
  createFamily: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);
let pendingInvitationAcceptance: Promise<string | null> | null = null;

async function acceptRememberedInvitation(): Promise<string | null> {
  if (typeof window === "undefined" || window.location.pathname === "/join") return null;
  const token = readPendingInvitation();
  if (!token) return null;

  if (!pendingInvitationAcceptance) {
    pendingInvitationAcceptance = (async () => {
      const { error } = await getSupabaseBrowserClient().rpc("accept_family_invitation", {
        invitation_token: token,
      });
      if (!error) {
        clearPendingInvitation();
        return null;
      }

      // A server response means this token cannot be completed silently. Clear it so
      // the account does not retry forever, then surface the reason before family setup.
      if (!/failed to fetch|network/i.test(error.message)) clearPendingInvitation();
      return error.message;
    })();
  }

  const activeAttempt = pendingInvitationAcceptance;
  try {
    return await activeAttempt;
  } finally {
    if (pendingInvitationAcceptance === activeAttempt) pendingInvitationAcceptance = null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<FamilySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    setError(null);

    if (!nextSession) {
      setProfile(null);
      setFamily(null);
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const invitationError = await acceptRememberedInvitation();
    if (invitationError) setError(invitationError);

    const [profileResult, membershipResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", nextSession.user.id).maybeSingle(),
      supabase
        .from("family_members")
        .select("family_id, role")
        .eq("user_id", nextSession.user.id)
        .limit(1)
        .maybeSingle(),
    ]);

    if (profileResult.error) throw profileResult.error;
    if (membershipResult.error) throw membershipResult.error;
    setProfile(profileResult.data);

    if (!membershipResult.data) {
      setFamily(null);
      setLoading(false);
      return;
    }

    const familyResult = await supabase
      .from("families")
      .select("id, name")
      .eq("id", membershipResult.data.family_id)
      .single();
    if (familyResult.error) throw familyResult.error;

    setFamily({ ...familyResult.data, role: membershipResult.data.role });
    setLoading(false);
  }, []);

  const refreshWorkspace = useCallback(async () => {
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

  useEffect(() => {
    void refreshWorkspace();
    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void loadWorkspace(nextSession).catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Mesa could not load your account.");
        setLoading(false);
      });
    });
    return () => subscription.unsubscribe();
  }, [loadWorkspace, refreshWorkspace]);

  const value = useMemo<AuthValue>(
    () => ({
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
            emailRedirectTo: redirectTo ?? getPublicSiteUrl(),
          },
        });
        if (signInError) throw signInError;
      },
      createFamily: async (name) => {
        if (!session?.user) throw new Error("Sign in before creating a family.");
        setError(null);
        const { error: insertError } = await getSupabaseBrowserClient()
          .from("families")
          .insert({ name: name.trim() || "Our family", created_by: session.user.id });
        if (insertError) throw insertError;
        await refreshWorkspace();
      },
      signOut: async () => {
        const { error: signOutError } = await getSupabaseBrowserClient().auth.signOut();
        if (signOutError) throw signOutError;
      },
      refreshWorkspace,
    }),
    [error, family, loading, profile, refreshWorkspace, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
