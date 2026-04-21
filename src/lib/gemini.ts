import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  CodingQuestion,
  Concept,
  Difficulty,
  MCQQuestion,
  Question,
} from '../questions/schema';
import { runCoding } from '../db/sqlEngine';

export interface GenerateOpts {
  apiKey: string;
  type: 'coding' | 'mcq';
  difficulty: Difficulty;
  concepts: Concept[];
  /** Optional one-line theme so the user can steer e.g. "library lending data". */
  topic?: string;
}

const MODEL = 'gemini-2.0-flash';
const MAX_ATTEMPTS = 3;

const KNOWN_CONCEPTS: Concept[] = [
  'SELECT',
  'WHERE',
  'ORDER BY',
  'GROUP BY',
  'Aggregation',
  'JOIN',
  'Subquery',
  'CTE',
  'Window Functions',
  'UNION',
  'CASE',
  'Date/Time',
  'String Functions',
];

function codingPrompt(opts: GenerateOpts): string {
  return [
    'You are generating one SQL practice question for a SQLite-based browser app.',
    'Return STRICT JSON only — no markdown fences, no commentary.',
    '',
    'JSON shape:',
    '{',
    '  "type": "coding",',
    '  "difficulty": "easy" | "medium" | "hard",',
    '  "concepts": string[],            // subset of the allowed list below',
    '  "title": string,                  // human Title Case, < 60 chars',
    '  "prompt": string,                 // markdown allowed; describe the task',
    '  "schemaSql": string,              // CREATE TABLE + INSERT statements; SQLite syntax',
    '  "expectedSql": string,            // reference SELECT producing the answer rows',
    '  "orderMatters": boolean,          // true only if the prompt requires a specific row order',
    '  "hint": string                    // one-sentence hint',
    '}',
    '',
    `Difficulty: ${opts.difficulty}`,
    `Concepts (must include at least one): ${opts.concepts.join(', ')}`,
    `Allowed concept tags: ${KNOWN_CONCEPTS.join(', ')}`,
    opts.topic ? `Topic / theme: ${opts.topic}` : '',
    '',
    'Hard rules:',
    '- SQLite dialect only. No TOP, no DATEADD, no CONCAT, no DATEPART. Use LIMIT, strftime, ||, date().',
    '- schemaSql must seed enough rows that expectedSql returns at least 1 row.',
    '- expectedSql must run successfully against schemaSql with no other input.',
    '- Do not reference tables you did not CREATE in schemaSql.',
    '- Keep schemas small (1-3 tables, < 12 rows total).',
  ]
    .filter(Boolean)
    .join('\n');
}

function mcqPrompt(opts: GenerateOpts): string {
  return [
    'You are generating one SQL multiple-choice question for a SQLite-based browser app.',
    'Return STRICT JSON only — no markdown fences, no commentary.',
    '',
    'JSON shape:',
    '{',
    '  "type": "mcq",',
    '  "difficulty": "easy" | "medium" | "hard",',
    '  "concepts": string[],            // subset of the allowed list below',
    '  "title": string,                  // human Title Case, < 60 chars',
    '  "prompt": string,                 // the question stem; markdown allowed',
    '  "options": [{ "id": "a", "text": "..." }, { "id": "b", "text": "..." }, { "id": "c", "text": "..." }, { "id": "d", "text": "..." }],',
    '  "correctOptionId": "a" | "b" | "c" | "d",',
    '  "explanation": string             // 1-2 sentences why the answer is right',
    '}',
    '',
    `Difficulty: ${opts.difficulty}`,
    `Concepts (must include at least one): ${opts.concepts.join(', ')}`,
    `Allowed concept tags: ${KNOWN_CONCEPTS.join(', ')}`,
    opts.topic ? `Topic / theme: ${opts.topic}` : '',
    '',
    'Hard rules:',
    '- Exactly 4 options with ids a, b, c, d.',
    '- correctOptionId must be one of those 4.',
    '- SQLite dialect for any SQL shown in options.',
  ]
    .filter(Boolean)
    .join('\n');
}

function stripFence(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```$/, '')
      .trim();
  }
  return trimmed;
}

function newId(): string {
  // gen-<base36 timestamp>-<random> — short, sortable-ish, unlikely to collide for one user.
  return `gen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function validateConcepts(raw: unknown): Concept[] {
  if (!Array.isArray(raw)) return [];
  const out: Concept[] = [];
  for (const c of raw) {
    if (typeof c === 'string' && (KNOWN_CONCEPTS as string[]).includes(c)) {
      out.push(c as Concept);
    }
  }
  return out;
}

function shapeCoding(parsed: any): CodingQuestion {
  if (typeof parsed.title !== 'string') throw new Error('missing title');
  if (typeof parsed.prompt !== 'string') throw new Error('missing prompt');
  if (typeof parsed.schemaSql !== 'string') throw new Error('missing schemaSql');
  if (typeof parsed.expectedSql !== 'string') throw new Error('missing expectedSql');
  if (!['easy', 'medium', 'hard'].includes(parsed.difficulty)) {
    throw new Error('bad difficulty');
  }
  const concepts = validateConcepts(parsed.concepts);
  if (concepts.length === 0) throw new Error('no valid concepts');

  return {
    id: newId(),
    type: 'coding',
    difficulty: parsed.difficulty,
    concepts,
    title: parsed.title.trim(),
    prompt: parsed.prompt.trim(),
    schemaSql: parsed.schemaSql,
    expectedSql: parsed.expectedSql,
    orderMatters: !!parsed.orderMatters,
    hint: typeof parsed.hint === 'string' ? parsed.hint : undefined,
    source: 'generated',
  };
}

function shapeMCQ(parsed: any): MCQQuestion {
  if (typeof parsed.title !== 'string') throw new Error('missing title');
  if (typeof parsed.prompt !== 'string') throw new Error('missing prompt');
  if (!Array.isArray(parsed.options) || parsed.options.length !== 4) {
    throw new Error('options must be length 4');
  }
  if (typeof parsed.correctOptionId !== 'string') {
    throw new Error('missing correctOptionId');
  }
  if (typeof parsed.explanation !== 'string') throw new Error('missing explanation');
  if (!['easy', 'medium', 'hard'].includes(parsed.difficulty)) {
    throw new Error('bad difficulty');
  }
  const concepts = validateConcepts(parsed.concepts);
  if (concepts.length === 0) throw new Error('no valid concepts');

  const options = parsed.options.map((o: any, i: number) => {
    const id = typeof o?.id === 'string' ? o.id : ['a', 'b', 'c', 'd'][i];
    if (typeof o?.text !== 'string') throw new Error('option missing text');
    return { id, text: o.text };
  });

  if (!options.some((o: any) => o.id === parsed.correctOptionId)) {
    throw new Error('correctOptionId does not match any option');
  }

  return {
    id: newId(),
    type: 'mcq',
    difficulty: parsed.difficulty,
    concepts,
    title: parsed.title.trim(),
    prompt: parsed.prompt.trim(),
    options,
    correctOptionId: parsed.correctOptionId,
    explanation: parsed.explanation.trim(),
    source: 'generated',
  };
}

async function callModel(opts: GenerateOpts): Promise<string> {
  const client = new GoogleGenerativeAI(opts.apiKey);
  const model = client.getGenerativeModel({
    model: MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  });
  const promptText = opts.type === 'coding' ? codingPrompt(opts) : mcqPrompt(opts);
  const res = await model.generateContent(promptText);
  return res.response.text();
}

/**
 * Generate one question, validating it before returning. For coding questions
 * we additionally execute schemaSql + expectedSql through sql.js so a model
 * hallucinating non-SQLite syntax (TOP, DATEADD, CONCAT) is caught here, not
 * when the user clicks Run.
 *
 * Retries up to MAX_ATTEMPTS times if the model returns invalid JSON or the
 * generated SQL fails to execute.
 */
export async function generateQuestion(opts: GenerateOpts): Promise<Question> {
  if (!opts.apiKey) throw new Error('Gemini API key is empty.');
  if (opts.concepts.length === 0) throw new Error('Pick at least one concept.');

  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const raw = await callModel(opts);
      const parsed = JSON.parse(stripFence(raw));

      if (opts.type === 'coding') {
        const q = shapeCoding(parsed);
        const outcome = await runCoding(q.schemaSql, q.expectedSql, q.expectedSql, q.orderMatters);
        if (!outcome.ok) {
          throw new Error(`Generated SQL failed: ${outcome.error}`);
        }
        if (!outcome.expected || outcome.expected.rows.length === 0) {
          throw new Error('Generated expectedSql returned no rows.');
        }
        return q;
      }

      return shapeMCQ(parsed);
    } catch (err) {
      lastErr = err;
      console.warn(`[gemini] attempt ${attempt} failed:`, err);
      // Don't retry quota / auth errors — they won't fix themselves and
      // each retry burns more of the (already exhausted) free-tier budget.
      const msg = err instanceof Error ? err.message : String(err);
      if (/\b(429|403|401)\b/.test(msg) || /quota|rate/i.test(msg)) break;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('Failed to generate a valid question after retries.');
}
