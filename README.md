# SQL Practice

A browser-based SQL practice app. Coding quizzes run real SQLite in your browser via [sql.js](https://sql.js.org/); multiple-choice questions drill SQL concepts. Progress syncs to Firestore and you can generate new practice questions with Gemini.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS (brutalist theme)
- sql.js (SQLite compiled to WebAssembly)
- CodeMirror 6 (SQL editor)
- Firebase Auth (Google) + Firestore (progress + user-generated questions)
- Google Gemini API free tier (generate new questions from the browser)

## Dev

```bash
npm install
npm run dev
```

Open http://localhost:5173.

To enable auth + sync, copy `.env.example` → `.env.local` and fill in your Firebase project config. See [CLAUDE.md](./CLAUDE.md) for Firestore rules and the full setup walkthrough.

## Build

```bash
npm run build
npm run preview
```

## Features

- **38+ seed questions** across SELECT, WHERE, ORDER BY, GROUP BY, Aggregation, JOIN, Subquery, CTE, Window Functions, UNION.
- **Home** — search, type/difficulty/status filters, concept chips, and a dense responsive card grid (1 / 2 / 4 cols).
- **Coding quiz** — write SQL in CodeMirror; answer is executed in-browser against a fresh SQLite DB and compared to the reference `expectedSql`. Errors and row mismatches surface above the result table.
- **Multiple choice** — option list with an explanation panel that reveals on selection.
- **Progress sync** — signed-in users' solve status + attempts sync live to Firestore; the nav `SyncIndicator` surfaces permission / network errors.
- **AI question generation** — `GENERATE` button opens a modal: save your own Gemini key, pick type / difficulty / concepts / optional topic, preview the generated question in-modal, then `SAVE` or `DISCARD`. Saved questions land in the grid with a blue `GEN` badge and can be deleted from the card.

## Not yet implemented

- Firebase Hosting deploy (`npm run deploy`)
