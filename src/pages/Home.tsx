import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2, HelpCircle } from 'lucide-react';
import { seedQuestions } from '../questions/seed';
import TechnicalBadge from '../components/TechnicalBadge';

export default function Home() {
  const coding = seedQuestions.filter((q) => q.type === 'coding');
  const mcqs = seedQuestions.filter((q) => q.type === 'mcq');

  return (
    <div className="grid lg:grid-cols-12 min-h-[calc(100vh-144px)]">
      {/* Hero */}
      <div className="lg:col-span-12 border-b-2 border-zinc-950 p-10 lg:p-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-4xl">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-4 block">
              00 / INTRODUCTION
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none uppercase">
              Data Driven Fluency.
            </h2>
          </div>
          <div className="max-w-xs pb-2">
            <p className="text-sm font-medium leading-relaxed text-zinc-500">
              Technical acquisition platform for relational logic. High-contrast environment. Zero visual noise.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 pt-8 border-t border-zinc-200">
          <div className="md:col-span-6 flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 min-w-[100px]">
              MODULES_LOADED
            </div>
            <div className="h-2 bg-stone-200 flex-1 overflow-hidden">
              <div className="h-full bg-zinc-950" style={{ width: '100%' }}></div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {seedQuestions.length.toString().padStart(2, '0')} / {seedQuestions.length.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="lg:col-span-12 grid md:grid-cols-2">
        <section className="p-10 lg:p-16 border-r-2 border-zinc-950">
          <div className="flex items-center justify-between mb-12 border-b-2 border-zinc-950 pb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em]">
              01. CODING_LABS
            </h3>
            <Code2 size={16} />
          </div>
          <ul className="space-y-12">
            {coding.map((q, i) => (
              <li key={q.id}>
                <Link to={`/practice/${q.id}`} className="group cursor-pointer block">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-zinc-300">
                      [{String(i + 1).padStart(2, '0')}]
                    </span>
                    <TechnicalBadge type={q.difficulty}>{q.difficulty}</TechnicalBadge>
                  </div>
                  <div className="flex items-start justify-between">
                    <h4 className="text-xl font-black tracking-tight group-hover:text-blue-700 transition-colors uppercase">
                      {q.title.replace(/\s+/g, '_').toUpperCase()}
                    </h4>
                    <ArrowUpRight
                      size={20}
                      className="text-zinc-300 group-hover:text-blue-700 transition-all"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-zinc-400 mt-2 uppercase tracking-wider">
                    {q.concepts.join(' · ')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="p-10 lg:p-16">
          <div className="flex items-center justify-between mb-12 border-b-2 border-zinc-950 pb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em]">
              02. LOGIC_TESTS
            </h3>
            <HelpCircle size={16} />
          </div>
          <ul className="space-y-12">
            {mcqs.map((q, i) => (
              <li key={q.id}>
                <Link to={`/practice/${q.id}`} className="group cursor-pointer block">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-zinc-300">
                      [{String(i + 1).padStart(2, '0')}]
                    </span>
                    <TechnicalBadge type={q.difficulty}>{q.difficulty}</TechnicalBadge>
                  </div>
                  <div className="flex items-start justify-between">
                    <h4 className="text-xl font-black tracking-tight group-hover:text-blue-700 transition-colors uppercase">
                      {q.title.replace(/\s+/g, '_').toUpperCase()}
                    </h4>
                    <ArrowUpRight
                      size={20}
                      className="text-zinc-300 group-hover:text-blue-700 transition-all"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-zinc-400 mt-2 uppercase tracking-wider">
                    {q.concepts.join(' · ')}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
