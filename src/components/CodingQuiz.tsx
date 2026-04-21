import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { ArrowRight, Hash, Terminal, Trophy, X } from 'lucide-react';
import {
  previewSchema,
  runCoding,
  type RunOutcome,
  type TablePreview,
} from '../db/sqlEngine';
import TechnicalBadge from './TechnicalBadge';
import Markdown from './Markdown';
import SchemaTable from './SchemaTable';
import { useAuth } from '../lib/auth';
import { mergeStatus, recordAttempt, useProgress } from '../lib/progress';
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
  const [tables, setTables] = useState<TablePreview[]>([]);
  const [showSchemaSql, setShowSchemaSql] = useState(false);
  const { user } = useAuth();
  const progress = useProgress();

  useEffect(() => {
    let cancelled = false;
    previewSchema(question.schemaSql).then((t) => {
      if (!cancelled) setTables(t);
    });
    return () => {
      cancelled = true;
    };
  }, [question.schemaSql]);

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

    // Record the attempt. Silent no-op when signed out or Firebase unconfigured.
    const passed = !!(r.ok && r.match);
    const prev = progress[question.id];
    const nextStatus = mergeStatus(
      prev?.status,
      passed ? 'solved' : r.ok ? 'wrong' : 'attempted',
    );
    try {
      await recordAttempt(
        user?.uid,
        question.id,
        nextStatus,
        code,
        prev?.attempts ?? 0,
      );
    } catch (err) {
      // Non-fatal — progress sync should never block practice.
      console.warn('recordAttempt failed', err);
    }
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

  // Total reserved height: 80px nav + 40px footer = 120px.
  // Grid fills remaining viewport; each column scrolls internally.
  return (
    <div
      className="grid lg:grid-cols-12 overflow-hidden"
      style={{ height: 'calc(100vh - 120px)' }}
    >
      {/* LEFT: briefing (scrolls internally) */}
      <div className="lg:col-span-5 border-r-2 border-zinc-950 bg-stone-100/50 overflow-y-auto h-full">
        <div className="px-8 lg:px-10 py-6 lg:py-8">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
            <button
              onClick={onExit}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950 flex items-center gap-3"
            >
              <X size={16} /> TERMINATE_SESSION
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 font-mono">
              {question.id.toUpperCase()}
            </span>
          </div>

          <div className="mt-6 space-y-7">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <TechnicalBadge type={question.difficulty}>
                  {question.difficulty}
                </TechnicalBadge>
                {question.concepts.map((c) => (
                  <TechnicalBadge key={c}>{c}</TechnicalBadge>
                ))}
              </div>
              <h2 className="text-[28px] lg:text-[32px] font-black tracking-tight leading-[1.05] text-zinc-950">
                {question.title}
              </h2>
            </div>

            <div className="border-l-4 border-zinc-950 pl-5 py-1">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">
                BRIEFING
              </div>
              <p className="font-sans text-[17px] leading-[1.55] text-zinc-800">
                <Markdown text={question.prompt} />
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                  <Hash size={14} /> ARCHITECTURE_SCHEMA
                </div>
                <button
                  onClick={() => setShowSchemaSql((s) => !s)}
                  className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950"
                >
                  {showSchemaSql ? '— HIDE_DDL' : '+ VIEW_DDL'}
                </button>
              </div>
              <div className="space-y-3">
                {tables.map((t) => (
                  <SchemaTable key={t.name} table={t} />
                ))}
                {tables.length === 0 && (
                  <div className="text-[11px] font-mono text-zinc-400 p-3 border border-dashed border-zinc-300">
                    LOADING_SCHEMA…
                  </div>
                )}
              </div>
              {showSchemaSql && (
                <pre className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 p-4 border-l-4 border-blue-700 whitespace-pre-wrap overflow-auto">
                  {question.schemaSql.trim()}
                </pre>
              )}
            </div>

            {question.hint && (
              <details className="group border-2 border-zinc-950 bg-white">
                <summary className="cursor-pointer list-none px-5 py-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    INTEL_HINT
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 group-open:hidden">
                    + REVEAL
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 hidden group-open:inline">
                    — HIDE
                  </span>
                </summary>
                <div className="px-5 pb-5">
                  <p className="font-serif text-base leading-relaxed text-zinc-800 italic">
                    {question.hint}
                  </p>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: editor (top) + output (bottom). Right column itself does not scroll. */}
      <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
        {/* Editor pane */}
        <div className="flex-1 flex flex-col px-8 lg:px-10 py-6 lg:py-8 min-h-0">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-5 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
              <Terminal size={14} /> SQL_INPUT_STREAM
            </span>
            <button
              onClick={onRun}
              disabled={running}
              className="px-8 py-2.5 bg-zinc-950 text-stone-50 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {running ? 'EXECUTING…' : 'EXECUTE'}
            </button>
          </div>

          <div className="flex-1 mt-6 border-2 border-zinc-950 bg-white overflow-hidden min-h-0">
            <CodeMirror
              value={code}
              height="100%"
              extensions={[sql()]}
              onChange={setCode}
              theme="light"
              basicSetup={{ lineNumbers: true, foldGutter: false }}
              style={{ height: '100%' }}
            />
          </div>
        </div>

        {/* Output pane — fixed height, internal scroll. Padded to align
            with the editor box's left/right gutters above. */}
        <div className="h-[38%] border-t-2 border-zinc-950 bg-stone-100/50 px-8 lg:px-10 py-6 lg:py-8 flex flex-col min-h-0">
          {success ? (
            <SuccessBanner rows={rows} onNext={onExit} />
          ) : (
            <div className="flex flex-col h-full min-h-0 bg-white border-2 border-zinc-950 px-6 py-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  RUNTIME_OUTPUT
                </span>
              </div>
              <div className="flex-1 overflow-auto mt-4 min-h-0 space-y-4">
                {(runtimeError || mismatchError) && (
                  <div className="font-mono text-xs font-bold text-red-600 p-4 border-l-4 border-red-600 bg-red-50">
                    {runtimeError ?? mismatchError}
                  </div>
                )}
                {rows && rows.columns.length > 0 ? (
                  <ResultTable rows={rows} />
                ) : !runtimeError && !mismatchError ? (
                  <div className="h-full flex items-center justify-center text-zinc-200 text-[11px] font-black uppercase tracking-[0.5em] py-8">
                    [AWAITING_INPUT]
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessBanner({
  rows,
  onNext,
}: {
  rows: RunOutcome['user'];
  onNext: () => void;
}) {
  return (
    <div className="h-full flex flex-col min-h-0 border-2 border-zinc-950 overflow-hidden">
      {/* Header — the only green part */}
      <div className="bg-emerald-600 text-stone-50 px-6 py-4 flex items-center justify-between shrink-0 animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 bg-stone-50 text-emerald-600 flex items-center justify-center rounded-full animate-check-pop animate-success-ring">
            <Trophy size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-serif text-3xl leading-[1.05] text-stone-50">
              Nice work.
            </div>
            <div className="text-[11px] font-medium text-stone-50/85 mt-1">
              Your query matches the expected result.
            </div>
          </div>
        </div>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-stone-50 text-emerald-700 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-zinc-950 hover:text-stone-50 transition-colors flex items-center gap-3 shrink-0"
        >
          NEXT_MODULE <ArrowRight size={16} />
        </button>
      </div>
      {/* Result table — plain white, black text */}
      <div className="flex-1 bg-white overflow-auto px-6 py-4 min-h-0">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-3">
          RUNTIME_OUTPUT
        </div>
        {rows && rows.columns.length > 0 && <ResultTable rows={rows} />}
      </div>
    </div>
  );
}

function ResultTable({ rows }: { rows: NonNullable<RunOutcome['user']> }) {
  return (
    <table className="w-full text-left text-[11px] font-mono border-collapse">
      <thead>
        <tr className="border-b-2 border-zinc-950">
          {rows.columns.map((c) => (
            <th
              key={c}
              className="pb-2 pr-6 font-mono font-bold text-zinc-950 uppercase tracking-wider text-[10px]"
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
              <td key={j} className="py-2 pr-6">
                {cell === null ? 'NULL' : String(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
