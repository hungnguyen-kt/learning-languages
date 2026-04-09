"use client";

import { useState, FormEvent } from "react";
import { supabaseBrowserClient } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

export function LoginModal() {
  const { isLoginOpen, closeLogin } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!supabaseBrowserClient) {
        throw new Error("Supabase is not configured.");
      }

      if (mode === "login") {
        const { error: signInError } =
          await supabaseBrowserClient.auth.signInWithPassword({
            email,
            password,
          });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } =
          await supabaseBrowserClient.auth.signUp({
            email,
            password,
          });
        if (signUpError) throw signUpError;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      if (!supabaseBrowserClient) {
        throw new Error("Supabase is not configured.");
      }

      const { error } = await supabaseBrowserClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Google sign-in failed.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="absolute inset-0" onClick={closeLogin} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-stone-800">
            {mode === "login" ? "Log in to continue" : "Create an account"}
          </h2>
          <button
            onClick={closeLogin}
            className="text-stone-400 hover:text-stone-600 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-1 mb-4 text-xs">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full px-3 py-1.5 border text-xs transition ${
              mode === "login"
                ? "bg-amber-400 text-white border-amber-400"
                : "bg-white text-stone-500 border-stone-200 hover:border-amber-300 hover:text-amber-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full px-3 py-1.5 border text-xs transition ${
              mode === "signup"
                ? "bg-amber-400 text-white border-amber-400"
                : "bg-white text-stone-500 border-stone-200 hover:border-amber-300 hover:text-amber-600"
            }`}
          >
            Sign up
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-100 bg-rose-50/60 p-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-stone-600">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-stone-600">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-amber-200 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? mode === "login"
                ? "Logging in..."
                : "Signing up..."
              : mode === "login"
                ? "Log in"
                : "Sign up"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-stone-200" />
          <span className="text-[10px] uppercase tracking-[0.16em] text-stone-400">
            or
          </span>
          <div className="h-px flex-1 bg-stone-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="mt-3 w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:border-amber-300 hover:bg-amber-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="text-[18px]">G</span>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}

