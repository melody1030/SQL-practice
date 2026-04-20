# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

A browser-based SQL practice app. Two modes — **coding quiz** (real SQL executed client-side) and **multiple choice**. Runs entirely in the browser; deploys to Firebase Hosting; progress syncs via Firestore.

## Stack

- **React 18 + Vite + TypeScript**
- **Tailwind CSS v3** for styling. Color palette is intentionally minimal: `neutral-*` for surfaces/text, single `accent` color (indigo) for interactive elements, `emerald/amber/rose` only for difficulty pills and correct/wrong states. Two fonts: **Inter** (UI) + **JetBrains Mono** (code).
- **sql.js** — SQLite compiled to WebAssembly. Loaded from `https://sql.js.org/dist/` via `initSqlJs({ locateFile })`. See `src/db/sqlEngine.ts`.
- **@uiw/react-codemirror** + `@codemirror/lang-sql` for the SQL editor.
- **Firebase** (planned): Auth (Google) + Firestore (progress + user-generated questions) + Hosting.
- **@google/generative-ai** (planned): Gemini free-tier API, called directly from browser with a user-supplied key stored in Firestore.

## Common commands

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server on http://localhost:5173
npm run build      # type-check (tsc -b) and bundle
npm run preview    # serve the production build locally
npm run deploy     # build + firebase deploy (once Firebase is configured)
```

## Architecture

- `src/questions/schema.ts` — TS types: `Question = CodingQuestion | MCQQuestion`, `Difficulty`, `Concept`, `ProgressEntry`. **Single source of truth** for question shape. AI-generated questions must validate against these types.
- `src/questions/seed.ts` — hand-written question bank. Two shared schemas (`employeesSchema`, `ordersSchema`) are reused across questions to keep cognitive load low when practicing.
- `src/db/sqlEngine.ts` — wraps sql.js. `runCoding(schemaSql, userSql, expectedSql, orderMatters)`:
  1. Creates a fresh in-memory DB.
  2. Applies `schemaSql` (CREATE + INSERT).
  3. Runs `expectedSql` to derive the reference output (so question authors don't have to hand-encode rows).
  4. Runs the user's query, compares column count + row count + cell values. If `orderMatters` is false, both sides are sorted before comparison.
- `src/pages/Home.tsx` — filter bar (difficulty, type) + question list. Uses `seedQuestions` directly; will merge in Firestore-stored generated questions later.
- `src/pages/Practice.tsx` — routes to `CodingQuiz` or `MultipleChoice` based on `question.type`.

## Conventions

- SQL dialect is **SQLite** (what sql.js supports). When writing new questions, test them against SQLite syntax specifically — no `TOP`, no `DATEADD`, use `LIMIT`, `date()`, etc.
- Every question must have a `difficulty` and at least one `concepts[]` tag. Keep tag names identical to the `Concept` union in `schema.ts`.
- For coding questions, prefer writing `expectedSql` rather than hard-coded expected rows — this keeps schemas and expected output in sync if seed data changes.
- Max 3 font weights in UI (400, 500, 700). No shadows beyond `shadow-sm`. Rounded: `rounded-lg` or `rounded-xl`.

## Current milestone

**Milestone 1: scaffold + seed** — Done. Local dev works (`npm run dev`), 10 seed questions, coding + MCQ flows functional, no Firebase yet.

## Next milestones

2. Firebase Auth + Firestore for progress sync (per-user `users/{uid}/progress/{qid}`).
3. Gemini question generation — user enters API key in Settings, stored in Firestore. Generated questions validated by running their `schemaSql` + `expectedSql` before being added to the pool.
4. Firebase Hosting deploy.

## Update policy

Update this file on each major milestone completion so future Claude sessions land with accurate context.
