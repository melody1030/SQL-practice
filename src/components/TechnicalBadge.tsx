import type { Difficulty } from '../questions/schema';

interface Props {
  children: React.ReactNode;
  type?: Difficulty;
}

export default function TechnicalBadge({ children, type }: Props) {
  const colorClass =
    type === 'easy'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : type === 'medium'
      ? 'bg-blue-100 text-blue-800 border-blue-300'
      : type === 'hard'
      ? 'bg-red-100 text-red-800 border-red-300'
      : 'bg-stone-200 text-stone-600 border-stone-300';

  return (
    <span
      className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${colorClass}`}
    >
      {children}
    </span>
  );
}
