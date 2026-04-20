import { Link, useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { seedQuestions } from '../questions/seed';
import CodingQuiz from '../components/CodingQuiz';
import MultipleChoice from '../components/MultipleChoice';

export default function Practice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const question = seedQuestions.find((q) => q.id === id);

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-10 py-24 space-y-8">
        <Link
          to="/"
          className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-950 flex items-center gap-3"
        >
          <X size={16} /> TERMINATE_SESSION
        </Link>
        <p className="text-sm font-bold uppercase tracking-widest text-red-600">
          MODULE_NOT_FOUND
        </p>
      </div>
    );
  }

  if (question.type === 'coding') {
    return <CodingQuiz question={question} onExit={() => navigate('/')} />;
  }
  return <MultipleChoice question={question} onExit={() => navigate('/')} />;
}
