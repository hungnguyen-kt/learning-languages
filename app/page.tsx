"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { LearningCard, type CardData } from "../components/LearningCard";
import { Pagination } from "../components/Pagination";

const CARDS_PER_PAGE = 10;

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(cards.length / CARDS_PER_PAGE));

  const pageCards = useMemo(() => {
    return cards.slice(
      (currentPage - 1) * CARDS_PER_PAGE,
      currentPage * CARDS_PER_PAGE,
    );
  }, [cards, currentPage]);

  const loadCards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/practice-sentences", {
        method: "GET",
        cache: "no-store",
      });
      const data = (await res.json()) as unknown;

      if (!res.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error: unknown }).error)
            : "Failed to load sentences.";
        throw new Error(message);
      }

      const sentences = (data as { sentences?: unknown }).sentences;
      if (!Array.isArray(sentences)) {
        throw new Error("Invalid data from server.");
      }

      setCards(sentences as CardData[]);
      setCurrentPage(1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sentences.");
      setCards([]);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(ellipse 100% 50% at 50% 0%, #fef9ec 0%, #fafaf9 60%)",
        }}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center shadow-md shadow-amber-200">
                <BookOpen size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-stone-800">
                  VN · EN · JP
                </h1>
                <p className="text-[10px] text-stone-400 tracking-widest uppercase">
                  Translation Practice
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-stone-100 text-stone-400 px-2.5 py-1 rounded-full">
                Page {currentPage} of {totalPages}
              </span>
              <span className="bg-amber-50 text-amber-500 border border-amber-100 px-2.5 py-1 rounded-full">
                {cards.length} cards total
              </span>
              <button
                onClick={loadCards}
                disabled={isLoading}
                className="bg-white border border-stone-200 text-stone-500 px-2.5 py-1 rounded-full hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                {isLoading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </header>

        {/* Cards Grid */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {error && (
            <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: CARDS_PER_PAGE }, (_, i) => (
                <div
                  key={i}
                  className="bg-white/70 rounded-3xl border border-white/80 p-6 animate-pulse"
                >
                  <div className="h-4 w-2/3 bg-stone-200/70 rounded mb-3" />
                  <div className="h-3 w-1/2 bg-stone-200/60 rounded mb-6" />
                  <div className="h-9 w-full bg-stone-200/60 rounded-lg" />
                  <div className="h-9 w-full bg-stone-200/50 rounded-lg mt-3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pageCards.map((card, i) => (
                <LearningCard
                  key={card.id}
                  data={card}
                  index={(currentPage - 1) * CARDS_PER_PAGE + i + 1}
                />
              ))}
            </div>
          )}

          {!isLoading && cards.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={() => goToPage(Math.max(1, currentPage - 1))}
              onNext={() => goToPage(Math.min(totalPages, currentPage + 1))}
              onGo={goToPage}
            />
          )}

          <p className="text-center text-xs text-stone-300 pb-6">
            Press{" "}
            <kbd className="bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded text-xs">
              Enter
            </kbd>{" "}
            to check &nbsp;·&nbsp;{" "}
            <kbd className="bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded text-xs">
              Esc
            </kbd>{" "}
            to reset
          </p>
        </main>
      </div>
    </>
  );
}
