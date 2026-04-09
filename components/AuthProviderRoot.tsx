"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../hooks/useAuth";
import { LoginModal } from "./LoginModal";

export function AuthProviderRoot({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <LoginModal />
    </AuthProvider>
  );
}

