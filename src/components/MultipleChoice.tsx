import { useState } from 'react';
import { AlertCircle, Check, Trophy, X } from 'lucide-react';
import TechnicalBadge from './TechnicalBadge';
import type { MCQQuestion } from '../questions/schema';

export default function MultipleChoice({
  question,
  onExit,
}: {
  question: MCQQuestion;
  onExit: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correct = submitted && picked === question.correctOptionId;
  const correctOpt = question.options.find(
    (o) => o.id === question.correctOptionId,
  );

  function check(optId: string) {
    if (submitted) return;
    setPicked(optId);
    setSubmitted(true);
  }

  return (
    <div className="max-w-4xl mx-auto py-16 lg:py-24 px-6 lg:px-10 space-y-16">
      <button
        onClick={onExit}
        className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950 flex items-center gap-3 transition-colors"
      >
        <X size={16} /> TERMINATE_SESSION
      </button>

      <div className="space-y-12">
        <div className="space-y-8">
          <div className="flex flex-wrap gap-2">
            <TechnicalBadge type={question.difficulty}>
              {question.difficulty}
            </TechnicalBadge>
            {question.concepts.map((c) => (
              <TechnicalBadge key={c}>{c}</TechnicalBadge>
            ))}
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight uppercase">
            {question.prompt}
          </h2>
        </div>

        <div className="grid gap-4">
          {question.options.map((option) => {
            const isPicked = picked === option.id;
            const isCorrectOpt =
              submitted && option.id === question.correctOptionId;
            const isWrongPick = submitted && isPicked && !isCorrectOpt;

            return (
              <button
                key={option.id}
                onClick={() => check(option.id)}
                disabled={submitted}
                className={`w-full text-left p-6 lg:p-8 border-2 transition-all flex items-center justify-between gap-6
                  ${
                    isCorrectOpt
                      ? 'bg-emerald-600 border-emerald-600 text-stone-50'
                      : isWrongPick
                      ? 'bg-red-600 border-red-600 text-stone-50'
                      : isPicked
                      ? 'bg-zinc-950 border-zinc-950 text-stone-50'
                      : 'bg-white border-zinc-950/10 hover:border-zinc-950 text-zinc-900'
                  }
                `}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <span className="font-mono text-[10px] font-black uppercase opacity-60 mt-1.5">
                    {option.id}
                  </span>
                  <span className="text-base md:text-lg font-black tracking-tight uppercase break-words">
                    {option.text}
                  </span>
                </div>
                <div
                  className={`h-6 w-6 border-2 border-current flex items-center justify-center shrink-0 ${
                    isPicked ? 'bg-current' : ''
                  }`}
                >
                  {isPicked && (
                    <Check
                      size={14}
                      strokeWidth={4}
                      className={
                        isCorrectOpt
                          ? 'text-emerald-600'
                          : isWrongPick
                          ? 'text-red-600'
                          : 'text-zinc-950'
                      }
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {submitted && (
          <div
            className={`p-8 lg:p-10 border-4 ${
              correct
                ? 'bg-emerald-50 border-emerald-600'
                : 'bg-red-50 border-red-600'
            }`}
          >
            <div className="flex items-start gap-6 lg:gap-8">
              <div
                className={`h-12 w-12 border-2 border-current flex items-center justify-center shrink-0 ${
                  correct ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {correct ? <Trophy size={24} /> : <AlertCircle size={24} />}
              </div>
              <div className="space-y-4 lg:space-y-6 min-w-0">
                <h4
                  className={`text-xs font-black uppercase tracking-[0.3em] ${
                    correct ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {correct ? 'LOGIC_VERIFIED' : 'LOGIC_FAILURE'}
                </h4>
                {!correct && correctOpt && (
                  <p className="text-sm font-bold text-zinc-700 uppercase tracking-wide">
                    CORRECT_OPTION: {correctOpt.id.toUpperCase()} — {correctOpt.text}
                  </p>
                )}
                <p className="text-base lg:text-lg font-bold text-zinc-950 leading-relaxed">
                  {question.explanation}
                </p>
                <button
                  onClick={onExit}
                  className="py-3 px-10 border-2 border-zinc-950 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-950 hover:text-stone-50 transition-all"
                >
                  CLOSE_SESSION
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
