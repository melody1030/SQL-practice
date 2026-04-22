import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Loader2, Save, Sparkles, Trash2, X } from 'lucide-react';
import TechnicalBadge from './TechnicalBadge';
import { useAuth } from '../lib/auth';
import { useSettings } from '../lib/settings';
import { generateQuestion } from '../lib/gemini';
import { saveGenerated } from '../lib/generated';
import type { Concept, Difficulty, Question } from '../questions/schema';

const ALL_CONCEPTS: Concept[] = [
  'SELECT',
  'WHERE',
  'ORDER BY',
  'GROUP BY',
  'Aggregation',
  'JOIN',
  'Subquery',
  'CTE',
  'Window Functions',
  'UNION',
  'CASE',
  'Date/Time',
  'String Functions',
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called after a successful generate+save so the caller can navigate to the new question. */
  onGenerated?: (q: Question) => void;
}

export default function GenerateModal({ open, onClose, onGenerated }: Props) {
  const { user } = useAuth();
  const { settings, loading: settingsLoading, saveGeminiKey } = useSettings();
  const [keyDraft, setKeyDraft] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keyMsg, setKeyMsg] = useState<string | null>(null);

  const [type, setType] = useState<'coding' | 'mcq'>('coding');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [concepts, setConcepts] = useState<Concept[]>(['JOIN']);
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setKeyDraft(settings.geminiKey ?? '');
      setKeyMsg(null);
      setError(null);
      setPreview(null);
    }
  }, [open, settings.geminiKey]);

  if (!open) return null;

  const hasKey = !!settings.geminiKey;

  async function onSaveKey() {
    setSavingKey(true);
    setKeyMsg(null);
    try {
      await saveGeminiKey(keyDraft.trim());
      setKeyMsg('Saved.');
    } catch (err) {
      setKeyMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingKey(false);
    }
  }

  function toggleConcept(c: Concept) {
    setConcepts((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  async function onGenerate() {
    if (!user) {
      setError('Sign in first.');
      return;
    }
    if (!settings.geminiKey) {
      setError('Save a Gemini API key first.');
      return;
    }
    if (concepts.length === 0) {
      setError('Pick at least one concept.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const q = await generateQuestion({
        apiKey: settings.geminiKey,
        type,
        difficulty,
        concepts,
        topic: topic.trim() || undefined,
      });
      setPreview(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function onConfirmSave() {
    if (!user || !preview) return;
    setSaving(true);
    setError(null);
    try {
      await saveGenerated(user.uid, preview);
      onGenerated?.(preview);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  function onDiscard() {
    setPreview(null);
    setError(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/60 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="bg-stone-50 border-2 border-zinc-950 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-zinc-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <Sparkles size={16} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">
              GENERATE_MODULE
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-950">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* API key */}
          <section className="space-y-3">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              GEMINI_API_KEY
            </div>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                placeholder={settingsLoading ? 'LOADING…' : 'AIza…'}
                disabled={settingsLoading}
                className="flex-1 border-2 border-zinc-950 bg-white px-3 py-2 text-[11px] font-mono outline-none focus:border-blue-700 disabled:opacity-50"
              />
              <button
                onClick={() => setShowKey((s) => !s)}
                className="border-2 border-zinc-950 px-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-950 hover:text-stone-50"
              >
                {showKey ? 'HIDE' : 'SHOW'}
              </button>
              <button
                onClick={onSaveKey}
                disabled={savingKey || keyDraft.trim() === (settings.geminiKey ?? '')}
                className="flex items-center gap-2 bg-zinc-950 text-stone-50 px-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 disabled:opacity-30"
              >
                {savingKey ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                SAVE
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Stored in Firestore under <span className="font-mono">users/{'{uid}'}/settings/app</span>.
              Get a free key at <span className="font-mono">aistudio.google.com/app/apikey</span>.
            </p>
            {keyMsg && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                {keyMsg}
              </p>
            )}
          </section>

          <hr className="border-zinc-200" />

          {preview ? (
            <PreviewPanel
              question={preview}
              saving={saving}
              error={error}
              onSave={onConfirmSave}
              onDiscard={onDiscard}
            />
          ) : (
          /* Generation form */
          <section className="space-y-5">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              GENERATION_PARAMS
            </div>

            <Field label="TYPE">
              <Segmented
                value={type}
                onChange={(v) => setType(v as 'coding' | 'mcq')}
                options={[
                  { value: 'coding', label: 'CODING' },
                  { value: 'mcq', label: 'LOGIC' },
                ]}
              />
            </Field>

            <Field label="DIFFICULTY">
              <Segmented
                value={difficulty}
                onChange={(v) => setDifficulty(v as Difficulty)}
                options={[
                  { value: 'easy', label: 'EASY' },
                  { value: 'medium', label: 'MED' },
                  { value: 'hard', label: 'HARD' },
                ]}
              />
            </Field>

            <Field label="CONCEPTS">
              <div className="flex flex-wrap gap-1.5">
                {ALL_CONCEPTS.map((c) => {
                  const active = concepts.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleConcept(c)}
                      className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] border ${
                        active
                          ? 'bg-zinc-950 text-stone-50 border-zinc-950'
                          : 'bg-white text-zinc-500 border-zinc-300 hover:border-zinc-950 hover:text-zinc-950'
                      }`}
                    >
                      {c.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="TOPIC (OPTIONAL)">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. library lending data"
                className="w-full border-2 border-zinc-950 bg-white px-3 py-2 text-[11px] outline-none focus:border-blue-700"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 border-2 border-red-600 bg-red-50 p-3 text-[10px] font-bold text-red-700">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <button
              onClick={onGenerate}
              disabled={busy || !hasKey || !user}
              className="w-full flex items-center justify-center gap-3 bg-zinc-950 text-stone-50 py-3 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {busy ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> GENERATING…
                </>
              ) : (
                <>
                  <Sparkles size={14} /> GENERATE
                </>
              )}
            </button>
            {!user && (
              <p className="text-[10px] text-zinc-500 text-center">
                Sign in to save your key and generate questions.
              </p>
            )}
            {user && !hasKey && (
              <p className="text-[10px] text-zinc-500 text-center">
                Save a Gemini API key above to enable generation.
              </p>
            )}
          </section>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({
  question,
  saving,
  error,
  onSave,
  onDiscard,
}: {
  question: Question;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
          PREVIEW_GENERATED
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-700">
          {question.type === 'coding' ? 'CODING' : 'LOGIC'}
        </span>
      </div>

      <div className="border-2 border-zinc-950 bg-white p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <TechnicalBadge type={question.difficulty}>
            {question.difficulty}
          </TechnicalBadge>
          {question.concepts.map((c) => (
            <TechnicalBadge key={c}>{c}</TechnicalBadge>
          ))}
        </div>
        <h4 className="text-xl font-black tracking-tight leading-snug text-zinc-950">
          {question.title}
        </h4>
        <p className="text-[13px] leading-relaxed text-zinc-700 whitespace-pre-wrap">
          {question.prompt}
        </p>

        {question.type === 'coding' ? (
          <details className="border border-zinc-200">
            <summary className="cursor-pointer px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              + SCHEMA / EXPECTED_SQL
            </summary>
            <pre className="font-mono text-[11px] text-blue-900 bg-blue-50 p-3 whitespace-pre-wrap overflow-auto">
{`-- schemaSql\n${question.schemaSql.trim()}\n\n-- expectedSql\n${question.expectedSql.trim()}`}
            </pre>
          </details>
        ) : (
          <ul className="space-y-1.5">
            {question.options.map((o) => {
              const correct = o.id === question.correctOptionId;
              return (
                <li
                  key={o.id}
                  className={`text-[12px] px-3 py-2 border ${
                    correct
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-zinc-200 text-zinc-700'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-60 mr-2">
                    {o.id.toUpperCase()}
                  </span>
                  {o.text}
                  {correct && (
                    <span className="ml-2 text-[9px] font-black uppercase tracking-widest">
                      ✓ correct
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 border-2 border-red-600 bg-red-50 p-3 text-[10px] font-bold text-red-700">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onDiscard}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-zinc-950 py-3 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-zinc-950 hover:text-stone-50 disabled:opacity-30"
        >
          <Trash2 size={12} /> DISCARD
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-950 text-stone-50 py-3 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-700 disabled:opacity-30"
        >
          {saving ? (
            <>
              <Loader2 size={12} className="animate-spin" /> SAVING…
            </>
          ) : (
            <>
              <Check size={12} strokeWidth={3} /> SAVE
            </>
          )}
        </button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
        {label}
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex border-2 border-zinc-950 bg-white">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-r-2 border-zinc-950 last:border-r-0 ${
              active ? 'bg-zinc-950 text-stone-50' : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
