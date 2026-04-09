"use client";

import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  // Currently this simply ensures the auth context exists.
  // Interaction-level checks are done via useAuth().requireAuth().
  useAuth();
  return <>{children}</>;
}

