import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2, HelpCircle, Search, X } from 'lucide-react';
import { seedQuestions } from '../questions/seed';
import TechnicalBadge from '../components/TechnicalBadge';
import type { Concept, Difficulty, Question } from '../questions/schema';

type TypeFilter = 'all' | 'coding' | 'mcq';
type DiffFilter = 'all' | Difficulty;

export default function Home() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('all');
  const [conceptFilter, setConceptFilter] = useState<Concept | 'all'>('all');

  const conceptsInUse = useMemo(() => {
    const set = new Set<Concept>();
    seedQuestions.forEach((q) => q.concepts.forEach((c) => set.add(c)));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return seedQuestions.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (diffFilter !== 'all' && item.difficulty !== diffFilter) return false;
      if (conceptFilter !== 'all' && !item.concepts.includes(conceptFilter))
        return false;
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
  }, [query, typeFilter, diffFilter, conceptFilter]);

  const total = seedQuestions.length;
  const shown = filtered.length;
  const hasActiveFilter =
    query !== '' ||
    typeFilter !== 'all' ||
    diffFilter !== 'all' ||
    conceptFilter !== 'all';

  function resetFilters() {
    setQuery('');
    setTypeFilter('all');
    setDiffFilter('all');
    setConceptFilter('all');
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

        <div className="pt-8 border-t border-zinc-200">
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 min-w-[100px]">
              MODULES_LOADED
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
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-t-2 border-l-2 border-zinc-950">
            {filtered.map((q, i) => (
              <QuestionCard key={q.id} q={q} index={i} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const Icon = q.type === 'coding' ? Code2 : HelpCircle;
  return (
    <li className="bg-stone-50 border-r-2 border-b-2 border-zinc-950">
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
          <TechnicalBadge type={q.difficulty}>{q.difficulty}</TechnicalBadge>
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
