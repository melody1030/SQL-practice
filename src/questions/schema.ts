export type Difficulty = 'easy' | 'medium' | 'hard';

export type Concept =
  | 'SELECT'
  | 'WHERE'
  | 'ORDER BY'
  | 'GROUP BY'
  | 'Aggregation'
  | 'JOIN'
  | 'Subquery'
  | 'CTE'
  | 'Window Functions'
  | 'UNION'
  | 'CASE'
  | 'Date/Time'
  | 'String Functions';

export interface CodingQuestion {
  id: string;
  type: 'coding';
  difficulty: Difficulty;
  concepts: Concept[];
  title: string;
  prompt: string;
  /** SQL executed before the user's query to set up tables + seed data. */
  schemaSql: string;
  /** Reference SQL producing the expected result. */
  expectedSql: string;
  /** If true, row order must match exactly. */
  orderMatters?: boolean;
  hint?: string;
  source?: 'seed' | 'generated';
}

export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQQuestion {
  id: string;
  type: 'mcq';
  difficulty: Difficulty;
  concepts: Concept[];
  title: string;
  prompt: string;
  options: MCQOption[];
  correctOptionId: string;
  explanation: string;
  source?: 'seed' | 'generated';
}

export type Question = CodingQuestion | MCQQuestion;

export interface ProgressEntry {
  questionId: string;
  status: 'solved' | 'attempted' | 'wrong';
  attempts: number;
  lastAnswer?: string;
  updatedAt: number;
}
