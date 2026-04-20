import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { seedQuestions } from '../questions/seed';
import DifficultyPill from '../components/DifficultyPill';
import type { Difficulty } from '../questions/schema';

const difficulties: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];
const types: ('all' | 'coding' | 'mcq')[] = ['all', 'coding', 'mcq'];

export default function Home() {
  const [diff, setDiff] = useState<Difficulty | 'all'>('all');
  const [type, setType] = useState<'all' | 'coding' | 'mcq'>('all');

  const filtered = useMemo(
    () =>
      seedQuestions.filter(
        (q) =>
          (diff === 'all' || q.difficulty === diff) &&
          (type === 'all' || q.type === type),
      ),
    [diff, type],
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-1">
        Practice SQL, anytime.
      </h1>
      <p className="text-neutral-600 mb-8 text-sm">
        Coding quizzes run real SQLite in your browser. Multiple-choice
        questions drill the concepts.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 rounded-lg bg-white border border-neutral-200 p-1 text-sm">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              className={`px-3 py-1 rounded-md capitalize ${
                diff === d
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg bg-white border border-neutral-200 p-1 text-sm">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-md ${
                type === t
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {t === 'all' ? 'All' : t === 'coding' ? 'Coding' : 'Multiple choice'}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {filtered.map((q) => (
          <li key={q.id}>
            <Link
              to={`/practice/${q.id}`}
              className="flex items-center justify-between gap-4 bg-white border border-neutral-200 rounded-xl px-4 py-3 hover:border-neutral-300 transition"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <DifficultyPill difficulty={q.difficulty} />
                  <span className="text-xs uppercase text-neutral-500 tracking-wide">
                    {q.type === 'coding' ? 'Coding' : 'MCQ'}
                  </span>
                </div>
                <div className="font-medium truncate">{q.title}</div>
                <div className="text-xs text-neutral-500 mt-1">
                  {q.concepts.join(' · ')}
                </div>
              </div>
              <div className="text-neutral-400 text-sm">→</div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-sm text-neutral-500">
            No questions match this filter yet.
          </li>
        )}
      </ul>
    </div>
  );
}
