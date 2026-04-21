import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  Code2,
  HelpCircle,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import TechnicalBadge from '../components/TechnicalBadge';
import { useAllQuestions } from '../questions/all';
import { useAuth } from '../lib/auth';
import { deleteGenerated } from '../lib/generated';
import { useProgress, type ProgressMap } from '../lib/progress';
import type { Concept, Difficulty, Question } from '../questions/schema';

type TypeFilter = 'all' | 'coding' | 'mcq';
type DiffFilter = 'all' | Difficulty;
type StatusFilter = 'all' | 'solved' | 'unsolved';

export default function Home() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('all');
  const [conceptFilter, setConceptFilter] = useState<Concept | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const progress = useProgress();
  const { user } = useAuth();
  const allQuestions = useAllQuestions();
  const solvedCount = useMemo(
    () => Object.values(progress).filter((p) => p.status === 'solved').length,
    [progress],
  );

  const conceptsInUse = useMemo(() => {
    const set = new Set<Concept>();
    allQuestions.forEach((q) => q.concepts.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [allQuestions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allQuestions.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (diffFilter !== 'all' && item.difficulty !== diffFilter) return false;
      if (conceptFilter !== 'all' && !item.concepts.includes(conceptFilter))
        return false;
      if (statusFilter !== 'all') {
        const solved = progress[item.id]?.status === 'solved';
        if (statusFilter === 'solved' && !solved) return false;
        if (statusFilter === 'unsolved' && solved) return false;
      }
      if (q) {
        const hay = (
          item.title +
          ' ' +
          item.concepts.join(' ') +
          ' ' +
          item.id
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, typeFilter, diffFilter, conceptFilter, statusFilter, progress, allQuestions]);

  const total = allQuestions.length;
  const shown = filtered.length;
  const hasActiveFilter =
    query !== '' ||
    typeFilter !== 'all' ||
    diffFilter !== 'all' ||
    conceptFilter !== 'all' ||
    statusFilter !== 'all';

  function resetFilters() {
    setQuery('');
    setTypeFilter('all');
    setDiffFilter('all');
    setConceptFilter('all');
    setStatusFilter('all');
  }

  return (
    <div className="min-h-[calc(100vh-120px)]">
      {/* Hero */}
      <div className="border-b-2 border-zinc-950 p-10 lg:p-16 space-y-8">
        <div className="space-y-5">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block">
            00 / INTRODUCTION
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none uppercase whitespace-nowrap">
            Data Driven Fluency.
          </h2>
          <p className="font-serif italic text-sm md:text-base lg:text-lg leading-snug text-zinc-500 whitespace-nowrap">
            Technical acquisition platform for relational logic. High-contrast environment. Zero visual noise.
          </p>
        </div>

        <div className="pt-8 border-t border-zinc-200 space-y-3">
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 min-w-[100px]">
              MODULES_SOLVED
            </div>
            <div className="h-2 bg-stone-200 flex-1 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${total > 0 ? (solvedCount / total) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 tabular-nums">
              {solvedCount.toString().padStart(2, '0')} / {total.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 min-w-[100px]">
              FILTER_MATCH
            </div>
            <div className="h-2 bg-stone-200 flex-1 overflow-hidden">
              <div
                className="h-full bg-zinc-950 transition-all"
                style={{ width: `${total > 0 ? (shown / total) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 tabular-nums">
              {shown.toString().padStart(2, '0')} / {total.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-20 z-30 bg-stone-50 border-b-2 border-zinc-950">
        <div className="px-6 lg:px-10 py-4 space-y-3">
          {/* Row 1: search + type + difficulty */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 border-2 border-zinc-950 bg-white px-3 py-2">
              <Search size={14} className="text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH_MODULES…"
                className="flex-1 bg-transparent outline-none text-[11px] font-black uppercase tracking-[0.2em] placeholder:text-zinc-300"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-zinc-400 hover:text-zinc-950"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <SegmentedControl
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as TypeFilter)}
              options={[
                { value: 'all', label: 'ALL' },
                { value: 'coding', label: 'CODING' },
                { value: 'mcq', label: 'LOGIC' },
              ]}
            />

            <SegmentedControl
              value={diffFilter}
              onChange={(v) => setDiffFilter(v as DiffFilter)}
              options={[
                { value: 'all', label: 'ANY' },
                { value: 'easy', label: 'EASY' },
                { value: 'medium', label: 'MED' },
                { value: 'hard', label: 'HARD' },
              ]}
            />

            <SegmentedControl
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={[
                { value: 'all', label: 'ALL' },
                { value: 'unsolved', label: 'TODO' },
                { value: 'solved', label: 'DONE' },
              ]}
            />
          </div>

          {/* Row 2: concept chips */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 shrink-0">
              CONCEPT /
            </span>
            <Chip
              active={conceptFilter === 'all'}
              onClick={() => setConceptFilter('all')}
            >
              ALL
            </Chip>
            {conceptsInUse.map((c) => (
              <Chip
                key={c}
                active={conceptFilter === c}
                onClick={() => setConceptFilter(c)}
              >
                {c.toUpperCase()}
              </Chip>
            ))}
            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="ml-auto text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950 shrink-0 flex items-center gap-1.5"
              >
                <X size={12} /> CLEAR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dense grid of question cards */}
      <div className="p-6 lg:p-10">
        {filtered.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-300 p-16 text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">
              NO_MODULES_MATCH_FILTER
            </div>
            <button
              onClick={resetFilters}
              className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 hover:text-zinc-950"
            >
              RESET_FILTERS
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 border-t-2 border-l-2 border-zinc-950">
            {filtered.map((q, i) => (
              <QuestionCard
                key={q.id}
                q={q}
                index={i}
                progress={progress}
                onDelete={
                  q.source === 'generated' && user
                    ? async () => {
                        if (!confirm(`Delete generated question "${q.title}"?`)) return;
                        await deleteGenerated(user.uid, q.id);
                      }
                    : undefined
                }
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function QuestionCard({
  q,
  index,
  progress,
  onDelete,
}: {
  q: Question;
  index: number;
  progress: ProgressMap;
  onDelete?: () => void | Promise<void>;
}) {
  const Icon = q.type === 'coding' ? Code2 : HelpCircle;
  const entry = progress[q.id];
  const solved = entry?.status === 'solved';
  const attempted = !!entry && !solved;
  const generated = q.source === 'generated';
  return (
    <li
      className={`relative border-r-2 border-b-2 border-zinc-950 ${
        solved ? 'bg-emerald-50' : generated ? 'bg-blue-50/40' : 'bg-stone-50'
      }`}
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void onDelete();
          }}
          title="Delete generated question"
          className="absolute bottom-5 right-5 lg:bottom-6 lg:right-6 z-10 text-zinc-400 hover:text-red-600"
        >
          <Trash2 size={12} />
        </button>
      )}
      <Link
        to={`/practice/${q.id}`}
        className="group flex flex-col h-full p-5 lg:p-6 hover:bg-white transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">
            <Icon size={12} />
            <span>{q.type === 'coding' ? 'CODING' : 'LOGIC'}</span>
            <span className="text-zinc-300">/</span>
            <span>[{String(index + 1).padStart(2, '0')}]</span>
          </div>
          <div className="flex items-center gap-2">
            {generated && (
              <span className="inline-flex items-center gap-1 bg-blue-700 text-stone-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={10} /> GEN
              </span>
            )}
            {solved && (
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-stone-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em]">
                <Check size={10} strokeWidth={4} /> DONE
              </span>
            )}
            {attempted && (
              <span className="inline-flex items-center bg-zinc-950/10 text-zinc-700 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em]">
                ×{entry!.attempts}
              </span>
            )}
            <TechnicalBadge type={q.difficulty}>{q.difficulty}</TechnicalBadge>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 flex-1">
          <h4 className="text-base lg:text-lg font-black tracking-tight leading-snug text-zinc-950 group-hover:text-blue-700 transition-colors break-words hyphens-auto min-w-0">
            {q.title}
          </h4>
          <ArrowUpRight
            size={18}
            className="shrink-0 text-zinc-300 group-hover:text-blue-700 transition-colors"
          />
        </div>

        <p className="text-[10px] font-bold text-zinc-400 mt-3 uppercase tracking-wider truncate">
          {q.concepts.join(' · ')}
        </p>
      </Link>
    </li>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex border-2 border-zinc-950 bg-white shrink-0">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors border-r-2 border-zinc-950 last:border-r-0 ${
              active
                ? 'bg-zinc-950 text-stone-50'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border transition-colors ${
        active
          ? 'bg-zinc-950 text-stone-50 border-zinc-950'
          : 'bg-white text-zinc-500 border-zinc-300 hover:border-zinc-950 hover:text-zinc-950'
      }`}
    >
      {children}
    </button>
  );
}
