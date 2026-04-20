import { Link, useParams } from 'react-router-dom';
import { seedQuestions } from '../questions/seed';
import DifficultyPill from '../components/DifficultyPill';
import CodingQuiz from '../components/CodingQuiz';
import MultipleChoice from '../components/MultipleChoice';

export default function Practice() {
  const { id } = useParams<{ id: string }>();
  const question = seedQuestions.find((q) => q.id === id);

  if (!question) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-sm text-neutral-600 mb-4">Question not found.</p>
        <Link to="/" className="text-accent text-sm hover:underline">
          ← Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← All questions
      </Link>
      <div className="mt-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <DifficultyPill difficulty={question.difficulty} />
          <span className="text-xs uppercase text-neutral-500 tracking-wide">
            {question.type === 'coding' ? 'Coding' : 'Multiple choice'}
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">{question.title}</h1>
        <p className="mt-2 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
          {question.prompt}
        </p>
        <div className="mt-3 text-xs text-neutral-500">
          Concepts: {question.concepts.join(' · ')}
        </div>
      </div>

      {question.type === 'coding' ? (
        <CodingQuiz question={question} />
      ) : (
        <MultipleChoice question={question} />
      )}
    </div>
  );
}
