"use client";

import { useState, KeyboardEvent } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

type LanguageInputRowProps = {
  flag: string;
  placeholder: string;
  lang: string;
  sourceVietnamese: string;
  value: string;
  onChange: (value: string) => void;
  onFeedback?: (feedback: unknown) => void;
  onCheckingChange?: (checking: boolean) => void;
};

export function LanguageInputRow({
  flag,
  placeholder,
  lang,
  sourceVietnamese,
  value,
  onChange,
  onFeedback,
  onCheckingChange,
}: LanguageInputRowProps) {
  const [isChecking, setIsChecking] = useState(false);
  const { requireAuth } = useAuth();

  const validate = async () => {
    if (!value.trim()) return;

    if (!requireAuth()) {
      return;
    }

    try {
      setIsChecking(true);
      onCheckingChange?.(true);
      const payload =
        lang === "en"
          ? { vn: sourceVietnamese, en: value }
          : { vn: sourceVietnamese, jp: value };

      const { data } = await axios.post("/api/gemini-check", payload);
      if (onFeedback) {
        onFeedback(data);
      }
    } catch (error: unknown) {
      console.error("Error calling Gemini API", error);
    } finally {
      setIsChecking(false);
      onCheckingChange?.(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") validate();
    if (e.key === "Escape") {
      onChange("");
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-lg select-none shrink-0">{flag}</span>
      <div className="flex-1 flex items-center border rounded-lg px-2.5 py-1.5 transition-all duration-200 bg-white border-stone-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-50">
        <input
          type="text"
          disabled={isChecking}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm text-stone-700 placeholder-stone-300 font-light tracking-wide"
          lang={lang}
        />
        {isChecking && (
          <span
            aria-label="Checking..."
            className="mr-1 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-200 border-t-amber-400"
          />
        )}
      </div>
      <button
        onClick={validate}
        disabled={isChecking}
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 bg-stone-100 text-stone-400 hover:bg-amber-400 hover:text-white active:scale-95"
        aria-label="Check answer"
      >
        {isChecking ? (
          <span className="text-[10px] font-medium">...</span>
        ) : (
          "✓"
        )}
      </button>
    </div>
  );
}
