# SQL Practice

A browser-based SQL practice app. Coding quizzes run real SQLite in your browser via [sql.js](https://sql.js.org/); multiple-choice questions drill SQL concepts.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- sql.js (SQLite compiled to WebAssembly)
- CodeMirror 6 (SQL editor)
- Firebase Auth + Firestore (planned — progress sync)
- Firebase Hosting (planned — deploy)
- Google Gemini API free tier (planned — generate new questions)

## Dev

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

## Current state (milestone 1)

- 10 seed questions (7 coding, 3 MCQ) covering SELECT, WHERE, ORDER BY, GROUP BY, Aggregation, JOIN, Subquery, Window Functions, CTE.
- Home page with difficulty + type filter.
- Practice page: run SQL against an in-browser SQLite DB, compare to expected output.
- MCQ page: pick an answer, see explanation.

## Not yet implemented

- Firebase (Auth + Firestore for progress)
- Gemini question generation
- Firebase Hosting deploy
