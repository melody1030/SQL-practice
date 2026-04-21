import { useMemo } from 'react';
import { seedQuestions } from './seed';
import { useGenerated } from '../lib/generated';
import type { Question } from './schema';

/**
 * Combined question pool: hand-written seed + the signed-in user's
 * Gemini-generated questions (newest generated first, then seed in
 * authored order). Components should prefer this over importing
 * seedQuestions directly so generated questions show up everywhere.
 */
export function useAllQuestions(): Question[] {
  const generated = useGenerated();
  return useMemo<Question[]>(() => [...generated, ...seedQuestions], [generated]);
}
