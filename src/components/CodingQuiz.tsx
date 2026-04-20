import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { ArrowRight, Hash, Terminal, X } from 'lucide-react';
import { runCoding, type RunOutcome } from '../db/sqlEngine';
import TechnicalBadge from './TechnicalBadge';
import type { CodingQuestion } from '../questions/schema';

export default function CodingQuiz({
  question,
  onExit,
}: {
  question: CodingQuestion;
  onExit: () => void;
}) {
  const [code, setCode] = useState('-- ENTER_SQL_COMMAND_HERE\n');
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [running, setRunning] = useState(false);

  async function onRun() {
    setRunning(true);
    const r = await runCoding(
      question.schemaSql,
      code,
      question.expectedSql,
      !!question.orderMatters,
    );
    setOutcome(r);
    setRunning(false);
  }

  const success = !!(outcome?.ok && outcome.match);
  const mismatchError =
    outcome?.ok && outcome.match === false
      ? 'RESULT_MISMATCH: THE DATA RETURNED DOES NOT ALIGN WITH REQUIREMENTS.'
      : null;
  const runtimeError = outcome?.error
    ? `SYNTAX_ERROR: ${outcome.error.toUpperCase()}`
    : null;

  const rows = outcome?.user;

  return (
    <div className="grid lg:grid-cols-12 min-h-[calc(100vh-80px)]">
      {/* Left: briefing */}
      <div className="lg:col-span-5 border-r-2 border-zinc-950 p-10 lg:p-12 overflow-y-auto space-y-12 bg-stone-100/50">
        <button
          onClick={onExit}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950 flex items-center gap-3"
        >
          <X size={16} /> TERMINATE_SESSION
        </button>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <TechnicalBadge type={question.difficulty}>
              {question.difficulty}
            </TechnicalBadge>
            {question.concepts.map((c) => (
              <TechnicalBadge key={c}>{c}</TechnicalBadge>
            ))}
          </div>
          <h2 className="text-5xl font-black tracking-tighter uppercase leading-[0.9]">
            {question.title.replace(/\s+/g, '_').toUpperCase()}
          </h2>
          <p className="text-sm font-medium leading-relaxed text-zinc-600 border-l-4 border-zinc-950 pl-6 py-2 whitespace-pre-wrap">
            {question.prompt}
          </p>
        </div>

        <div className="border border-zinc-950/10 bg-white p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-3">
            <Hash size={14} /> ARCHITECTURE_SCHEMA
          </div>
          <pre className="font-mono text-[12px] font-bold text-blue-900 bg-blue-50 p-6 border-l-4 border-blue-700 whitespace-pre-wrap overflow-auto">
            {question.schemaSql.trim()}
          </pre>
        </div>

        {question.hint && (
          <div className="p-8 border-2 border-zinc-950 space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              INTEL_HINT
            </div>
            <p className="text-xs font-bold text-zinc-800 leading-relaxed italic">
              {question.hint}
            </p>
          </div>
        )}
      </div>

      {/* Right: editor + output */}
      <div className="lg:col-span-7 flex flex-col">
        <div className="flex-1 flex flex-col p-10 lg:p-12 space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
              <Terminal size={14} /> SQL_INPUT_STREAM
            </span>
            <button
              onClick={onRun}
              disabled={running}
              className="px-10 py-3 bg-zinc-950 text-stone-50 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {running ? 'EXECUTING…' : 'EXECUTE'}
            </button>
          </div>

          <div className="flex-1 border-2 border-zinc-950 bg-white overflow-hidden">
            <CodeMirror
              value={code}
              height="100%"
              minHeight="260px"
              extensions={[sql()]}
              onChange={setCode}
              theme="light"
              basicSetup={{ lineNumbers: true, foldGutter: false }}
            />
          </div>
        </div>

        <div className="min-h-[340px] border-t-2 border-zinc-950 p-10 lg:p-12 space-y-8 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
              RUNTIME_OUTPUT
            </span>
            {success && (
              <span className="text-[10px] font-black text-emerald-600 uppercase border border-emerald-600 px-3 py-1">
                SOLVED_OK
              </span>
            )}
          </div>

          <div className="overflow-auto max-h-[240px]">
            {runtimeError ? (
              <div className="font-mono text-xs font-bold text-red-600 p-4 border-l-4 border-red-600 bg-red-50">
                {runtimeError}
              </div>
            ) : mismatchError ? (
              <div className="font-mono text-xs font-bold text-red-600 p-4 border-l-4 border-red-600 bg-red-50">
                {mismatchError}
              </div>
            ) : rows && rows.columns.length > 0 ? (
              <table className="w-full text-left text-[11px] font-mono border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-950">
                    {rows.columns.map((c) => (
                      <th
                        key={c}
                        className="pb-3 pr-6 font-black text-zinc-950 uppercase tracking-tighter"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-bold text-zinc-700">
                  {rows.rows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-zinc-100 last:border-0 hover:bg-stone-50"
                    >
                      {row.map((cell, j) => (
                        <td key={j} className="py-3 pr-6">
                          {cell === null ? 'NULL' : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-200 text-[11px] font-black uppercase tracking-[0.5em] py-8">
                [AWAITING_INPUT]
              </div>
            )}
          </div>

          {success && (
            <button
              onClick={onExit}
              className="w-full py-5 bg-zinc-950 text-stone-50 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
            >
              ADVANCE_TO_NEXT_MODULE <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
