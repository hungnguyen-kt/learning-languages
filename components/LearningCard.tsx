import { useState } from "react";
import { LanguageInputRow } from "./LanguageInputRow";
import { FeedbackPanel } from "./FeedbackPanel";

export type CardData = {
  id: number;
  vietnamese: string;
  english: string;
  japanese: string;
};

type LearningCardProps = {
  data: CardData;
  index: number;
};

type GeminiFeedback = {
  overall?: string;
  correction?: string;
  alternatives?: string[];
  grammarNote?: string;
  raw?: string;
  error?: string;
};

export function LearningCard({ data, index }: LearningCardProps) {
  const [enAnswer, setEnAnswer] = useState("");
  const [jpAnswer, setJpAnswer] = useState("");
  const [enFeedback, setEnFeedback] = useState<GeminiFeedback | null>(null);
  const [jpFeedback, setJpFeedback] = useState<GeminiFeedback | null>(null);
  const [enChecking, setEnChecking] = useState(false);
  const [jpChecking, setJpChecking] = useState(false);

  return (
    <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-stone-200/50 border border-white/80 p-6 flex flex-col gap-4 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 ease-out overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-linear-to-br from-amber-200/30 via-orange-100/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-linear-to-tr from-stone-200/20 to-transparent rounded-full blur-2xl" />

      <div className="relative bg-linear-to-br from-stone-50/80 via-amber-50/30 to-orange-50/20 rounded-2xl px-5 py-4 border border-stone-100/60 backdrop-blur-sm">
        <div className="absolute inset-0 bg-linear-to-r from-amber-400/5 to-transparent rounded-2xl" />
        <p
          className="relative text-base font-semibold text-stone-800 leading-relaxed"
          lang="vi"
        >
          <span className="inline-flex items-center text-[10px] mr-2 font-semibold tracking-wider uppercase text-amber-600 bg-linear-to-r from-amber-100 to-orange-50 px-3 py-1 rounded-full border border-amber-200/60 shadow-sm">
            #{index}
          </span>
          {data.vietnamese}
        </p>
      </div>

      <div className="flex items-center gap-3 px-2">
        <div className="flex-1 h-px bg-linear-to-r from-transparent via-stone-200 to-transparent" />
        <span className="text-[10px] text-stone-400 tracking-[0.2em] uppercase font-medium">
          translate
        </span>
        <div className="flex-1 h-px bg-linear-to-r from-transparent via-stone-200 to-transparent" />
      </div>

      <div className="relative grid grid-cols-1 gap-6">
        <div className="lang-en space-y-3">
          <LanguageInputRow
            flag="🇬🇧"
            placeholder="English translation..."
            lang="en"
            sourceVietnamese={data.vietnamese}
            value={enAnswer}
            onChange={setEnAnswer}
            onFeedback={(feedback) =>
              setEnFeedback(
                typeof feedback === "object" && feedback !== null
                  ? (feedback as GeminiFeedback)
                  : { raw: String(feedback) },
              )
            }
            onCheckingChange={(checking) => {
              setEnChecking(checking);
              if (checking) {
                setEnFeedback(null);
              }
            }}
          />
          {!enChecking && enFeedback && (
            <FeedbackPanel
              answer={enAnswer}
              answerPrefix="🇬🇧"
              feedback={enFeedback}
              labels={{
                yourAnswer: "Your answer:",
                aiFeedback: "AI Feedback:",
                overall: "Overall:",
                improved: "✨ Improved version:",
                alternatives: "📚 Alternative natural expressions:",
                grammarNote: "🧠 Grammar note:",
              }}
            />
          )}
        </div>

        <div className="lang-jp space-y-3">
          <LanguageInputRow
            flag="🇯🇵"
            placeholder="日本語訳..."
            lang="ja"
            sourceVietnamese={data.vietnamese}
            value={jpAnswer}
            onChange={setJpAnswer}
            onFeedback={(feedback) =>
              setJpFeedback(
                typeof feedback === "object" && feedback !== null
                  ? (feedback as GeminiFeedback)
                  : { raw: String(feedback) },
              )
            }
            onCheckingChange={(checking) => {
              setJpChecking(checking);
              if (checking) {
                setJpFeedback(null);
              }
            }}
          />
          {!jpChecking && jpFeedback && (
            <FeedbackPanel
              compact
              answer={jpAnswer}
              answerPrefix="🇯🇵"
              feedback={jpFeedback}
              labels={{
                yourAnswer: "あなたの答え:",
                aiFeedback: "AI フィードバック:",
                overall: "",
                improved: "✨ より自然な文:",
                alternatives: "📚 別の言い方:",
                grammarNote: "🧠 文法メモ:",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

