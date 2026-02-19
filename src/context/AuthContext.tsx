"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { mapAuthErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";

type SignInArgs = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (args: SignInArgs) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const sessionInitKey = "buyerhq_session_initialized";

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      // Prevent silent carry-over between browser sessions/tabs.
      if (typeof window !== "undefined") {
        const hasInit = window.sessionStorage.getItem(sessionInitKey) === "1";
        if (!hasInit) {
          window.sessionStorage.setItem(sessionInitKey, "1");
          await supabase.auth.signOut({ scope: "local" });
        }
      }

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const onPageClose = () => {
      void supabase.auth.signOut({ scope: "local" });
    };

    window.addEventListener("beforeunload", onPageClose);
    window.addEventListener("pagehide", onPageClose);
    return () => {
      window.removeEventListener("beforeunload", onPageClose);
      window.removeEventListener("pagehide", onPageClose);
    };
  }, [supabase]);

  const signIn = useCallback(
    async ({ email, password }: SignInArgs) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      return { error: error ? mapAuthErrorMessage(error.message) : null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut({ scope: "local" });
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/agent-portal/login`,
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const value = useMemo<AuthContextType>(
    () => ({ user, session, loading, signIn, signOut, resetPassword }),
    [loading, resetPassword, session, signIn, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
