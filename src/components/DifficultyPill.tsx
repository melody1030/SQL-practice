import type { Difficulty } from '../questions/schema';

const styles: Record<Difficulty, string> = {
  easy: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  hard: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export default function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
