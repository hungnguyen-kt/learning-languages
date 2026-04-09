type GeminiFeedback = {
  overall?: string;
  correction?: string;
  alternatives?: string[];
  grammarNote?: string;
  raw?: string;
  error?: string;
};

type Labels = {
  yourAnswer: string;
  aiFeedback: string;
  overall: string;
  improved: string;
  alternatives: string;
  grammarNote: string;
};

type FeedbackPanelProps = {
  answer: string;
  answerPrefix: string;
  feedback: GeminiFeedback;
  labels: Labels;
  compact?: boolean;
};

export function FeedbackPanel({
  answer,
  answerPrefix,
  feedback,
  labels,
  compact,
}: FeedbackPanelProps) {
  return (
    <div
      className={`feedback bg-linear-to-br from-slate-50 to-stone-50 border border-stone-100/80 rounded-xl shadow-inner ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="border-b border-stone-200 pb-2 mb-3">
        <p className="text-xs text-stone-500 font-medium mb-1">
          {labels.yourAnswer}
        </p>
        <p className="text-sm text-stone-700">{answer ? `${answerPrefix} ${answer}` : "—"}</p>
      </div>

      <div className="space-y-3">
        <div className="border-b border-stone-200 pb-3">
          <p className="text-xs text-stone-500 font-semibold mb-2">
            {labels.aiFeedback}
          </p>
          {feedback.overall && labels.overall && (
            <p className="text-sm text-stone-600">
              <span className="font-medium">{labels.overall}</span>{" "}
              {feedback.overall}
            </p>
          )}
          {feedback.overall && !labels.overall && (
            <p className="text-sm text-stone-600">{feedback.overall}</p>
          )}
          {feedback.error && (
            <p className="text-sm text-rose-600">
              <span className="font-medium">Error:</span> {feedback.error}
            </p>
          )}
          {feedback.raw && (
            <p className="text-xs text-stone-500 break-words">
              <span className="font-medium">Raw:</span> {feedback.raw}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-stone-500 font-semibold">{labels.improved}</p>
          <p className="text-sm text-emerald-700 font-medium pl-3">
            {feedback.correction ?? "—"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-stone-500 font-semibold">
            {labels.alternatives}
          </p>
          <ul className="space-y-1 pl-3 text-sm text-stone-600">
            {feedback.alternatives?.length
              ? feedback.alternatives.map((alt, idx) => <li key={idx}>• {alt}</li>)
              : null}
            {!feedback.alternatives && <li>—</li>}
            {feedback.alternatives?.length === 0 && <li>—</li>}
          </ul>
        </div>

        <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100/60">
          <p className="text-xs text-amber-800 font-semibold mb-1">
            {labels.grammarNote}
          </p>
          <p className="text-xs text-amber-700">{feedback.grammarNote ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}

