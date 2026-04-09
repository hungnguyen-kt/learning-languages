"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowserClient } from "../lib/supabaseClient";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  requireAuth: () => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (!supabaseBrowserClient) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const init = async () => {
      const { data, error } =
        await supabaseBrowserClient!.auth.getSession();
      if (!isMounted) return;

      if (error) {
        console.error("Supabase getSession error:", error);
      }
      setSession(data.session ?? null);
      setIsLoading(false);
    };

    void init();

    const { data: subscription } =
      supabaseBrowserClient!.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          setIsLoginOpen(false);
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const openLogin = useCallback(() => {
    setIsLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setIsLoginOpen(false);
  }, []);

  const requireAuth = useCallback(() => {
    if (!supabaseBrowserClient) {
      console.warn("Supabase is not configured; treating as unauthenticated.");
    }
    if (session) return true;
    setIsLoginOpen(true);
    return false;
  }, [session]);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    isLoading,
    isLoginOpen,
    openLogin,
    closeLogin,
    requireAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

