import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { runCoding, type RunOutcome } from '../db/sqlEngine';
import ResultTable from './ResultTable';
import type { CodingQuestion } from '../questions/schema';

export default function CodingQuiz({
  question,
  onSolved,
}: {
  question: CodingQuestion;
  onSolved?: () => void;
}) {
  const [code, setCode] = useState('-- Write your query here\n');
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [running, setRunning] = useState(false);
  const [showExpected, setShowExpected] = useState(false);

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
    if (r.ok && r.match) onSolved?.();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
          Schema
        </div>
        <pre className="text-xs bg-neutral-50 rounded-md p-3 overflow-auto font-mono text-neutral-700">
          {question.schemaSql.trim()}
        </pre>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-4 py-2 text-xs uppercase tracking-wide text-neutral-500 bg-neutral-50 border-b border-neutral-200">
          Your query
        </div>
        <CodeMirror
          value={code}
          height="180px"
          extensions={[sql()]}
          onChange={setCode}
          theme="light"
          basicSetup={{ lineNumbers: true, foldGutter: false }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRun}
          disabled={running}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {running ? 'Running…' : 'Run'}
        </button>
        <button
          onClick={() => setShowExpected((s) => !s)}
          className="px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100"
        >
          {showExpected ? 'Hide expected' : 'Show expected'}
        </button>
        {outcome?.ok && outcome.match && (
          <span className="text-sm text-emerald-700 font-medium">
            ✓ Correct
          </span>
        )}
        {outcome?.ok && outcome.match === false && (
          <span className="text-sm text-rose-700 font-medium">
            ✗ Output doesn't match
          </span>
        )}
      </div>

      {outcome?.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 font-mono whitespace-pre-wrap">
          {outcome.error}
        </div>
      )}

      {outcome?.user && (
        <div className="space-y-2">
          <ResultTable result={outcome.user} caption="Your result" />
        </div>
      )}

      {showExpected && outcome?.expected && (
        <ResultTable result={outcome.expected} caption="Expected result" />
      )}
    </div>
  );
}
