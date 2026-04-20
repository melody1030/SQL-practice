# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

A browser-based SQL practice app. Two modes — **coding quiz** (real SQL executed client-side) and **multiple choice**. Runs entirely in the browser; deploys to Firebase Hosting; progress syncs via Firestore.

## Stack

- **React 18 + Vite + TypeScript**
- **Tailwind CSS v3** for styling. Brutalist / technical aesthetic: `stone-50` canvas, `zinc-950` ink, 2px black borders as the primary structural device, no rounded corners, no shadows. Accent is `blue-700` on hover/focus. `emerald-600` / `red-600` reserved for pass/fail states only. Three fonts: **Inter** (UI, weights 700/900), **JetBrains Mono** (code + technical labels, uppercase with wide tracking), **Instrument Serif** (question prompts + hero subtitle, italic serif for prose contrast against the mono/sans UI).
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
- `src/pages/Home.tsx` — hero + sticky filter bar (text search, type segmented control, difficulty segmented control, concept chips) + dense responsive card grid (1/2/3 columns). `MODULES_LOADED` progress bar reflects filtered-count / total. Uses `seedQuestions` directly; will merge in Firestore-stored generated questions later.
- `src/pages/Practice.tsx` — routes to `CodingQuiz` or `MultipleChoice` based on `question.type`.
- `src/components/CodingQuiz.tsx` — fixed-viewport split: briefing (left, internally scrolling) with schema preview + optional DDL reveal + hint; editor + runtime output (right). Success state swaps in a green banner + result table with `NEXT_MODULE`.
- `src/components/MultipleChoice.tsx` — full-width serif prompt at top; options in a 1×N stack on the left, explanation / `[AWAITING_SELECTION]` placeholder sticky on the right. Option text is rendered in its original case (SQL keywords stay uppercase, prose stays prose).
- `src/components/Markdown.tsx` — inline mini-markdown (`**bold**`, `` `code` ``). `serif` mode renders inline code as italic serif blue-900 so it flows inside serif prompts without breaking the line.

## Conventions

- SQL dialect is **SQLite** (what sql.js supports). When writing new questions, test them against SQLite syntax specifically — no `TOP`, no `DATEADD`, use `LIMIT`, `date()`, etc.
- Every question must have a `difficulty` and at least one `concepts[]` tag. Keep tag names identical to the `Concept` union in `schema.ts`.
- For coding questions, prefer writing `expectedSql` rather than hard-coded expected rows — this keeps schemas and expected output in sync if seed data changes.
- Typography weights: 400 (serif prose), 700 (bold labels), 900 (headings, technical labels). No shadows. No rounded corners — edges are sharp to reinforce the brutalist grid. Borders are 2px `zinc-950`; hairline dividers are `border-zinc-200`.
- Technical labels (section headings, metadata rows) are `font-black uppercase tracking-[0.3em]` in mono — treat them as UI chrome, not content.
- Question titles render as-is (human title case) in cards and headers. Do not force-uppercase or underscore-join them — the earlier `TITLE_LIKE_THIS` treatment was abandoned because it broke overflow and readability.

## Current milestone

**Milestone 1: scaffold + seed + styled UI** — Done. Local dev works (`npm run dev`), 10 seed questions, coding + MCQ flows functional, brutalist theme applied across Home / CodingQuiz / MultipleChoice, Home has search + filter chips + dense card grid. No Firebase yet.

## Next milestones

2. Firebase Auth + Firestore for progress sync (per-user `users/{uid}/progress/{qid}`).
3. Gemini question generation — user enters API key in Settings, stored in Firestore. Generated questions validated by running their `schemaSql` + `expectedSql` before being added to the pool.
4. Firebase Hosting deploy.

## Update policy

Update this file on each major milestone completion so future Claude sessions land with accurate context.
