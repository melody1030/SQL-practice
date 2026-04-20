import { useState } from 'react';
import type { MCQQuestion } from '../questions/schema';

export default function MultipleChoice({
  question,
  onSolved,
}: {
  question: MCQQuestion;
  onSolved?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correct = submitted && picked === question.correctOptionId;

  function onSubmit() {
    if (!picked) return;
    setSubmitted(true);
    if (picked === question.correctOptionId) onSolved?.();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {question.options.map((opt) => {
          const isPicked = picked === opt.id;
          const isCorrectOpt = submitted && opt.id === question.correctOptionId;
          const isWrongPick = submitted && isPicked && !isCorrectOpt;
          return (
            <button
              key={opt.id}
              onClick={() => !submitted && setPicked(opt.id)}
              disabled={submitted}
              className={[
                'w-full text-left px-4 py-3 rounded-lg border transition',
                'disabled:cursor-default',
                isCorrectOpt
                  ? 'border-emerald-400 bg-emerald-50'
                  : isWrongPick
                  ? 'border-rose-400 bg-rose-50'
                  : isPicked
                  ? 'border-accent bg-indigo-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300',
              ].join(' ')}
            >
              <span className="font-mono text-xs text-neutral-500 mr-2 uppercase">
                {opt.id}
              </span>
              <span className="text-sm">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={onSubmit}
          disabled={!picked}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          Submit
        </button>
      )}

      {submitted && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            correct
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          <div className="font-medium mb-1">
            {correct ? '✓ Correct' : '✗ Not quite'}
          </div>
          <div>{question.explanation}</div>
        </div>
      )}
    </div>
  );
}
