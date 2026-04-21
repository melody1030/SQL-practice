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

**Milestone 3: Gemini question generation** — Done.
- `src/lib/settings.ts` — `useSettings()` reads/writes `users/{uid}/settings/app`. Single field today: `geminiKey`. `saveGeminiKey()` emits to syncStatus so a permission-denied surfaces in the nav.
- `src/lib/gemini.ts` — `generateQuestion({ apiKey, type, difficulty, concepts, topic })` calls `gemini-1.5-flash` with `responseMimeType: 'application/json'`, parses, and runs the result through a typed shape check (`shapeCoding` / `shapeMCQ`). Coding questions also execute their `schemaSql` + `expectedSql` through `runCoding` — if the model emits non-SQLite syntax (TOP, DATEADD, CONCAT) the validation fails and we retry up to 3 times before surfacing the error to the user. Generated questions get a fresh id like `gen-<base36-ts>-<rand>` and `source: 'generated'`.
- `src/lib/generated.ts` — `useGenerated()` is a live `onSnapshot` of `users/{uid}/generated`, ordered by server `createdAt` desc. `saveGenerated(uid, q)` writes the full Question payload as `{ question, createdAt }`. `deleteGenerated(uid, id)` removes a single doc. Both emit syncStatus.
- `src/questions/all.ts` — `useAllQuestions()` returns `[...generated, ...seed]`. Home and Practice import this instead of `seedQuestions` directly so generated questions appear in the grid, are filterable, and are routable.
- `src/components/GenerateModal.tsx` — opened from the nav `GENERATE` button (signed-in only). Top section: Gemini API key input with show/hide + save (placeholder text directs the user to `aistudio.google.com/app/apikey`). Bottom section: type / difficulty / concept-chips / optional topic, plus a single `GENERATE` button that runs `generateQuestion` → `saveGenerated` → navigate to the new question. Errors render inline in a red banner.
- `src/pages/Home.tsx` — generated questions get a blue `GEN` badge, faint blue card tint, and a hover trash icon (calls `deleteGenerated` after `confirm()`). Progress bar denominators now use `allQuestions.length` so adding a question grows the total.
- `src/pages/Practice.tsx` — looks up the question via `useAllQuestions()` so generated ids resolve.

**Milestone 2: Firebase Auth + progress sync** — Done.
- `src/lib/firebase.ts` — singleton init gated by `firebaseConfigured` (true when `VITE_FIREBASE_API_KEY` + `VITE_FIREBASE_PROJECT_ID` are set). Safe to import even when env is missing; `getFirebase()` throws only if called.
- `src/lib/auth.tsx` — `<AuthProvider>` + `useAuth()`, Google popup sign-in, `onAuthStateChanged` subscription. Wraps the tree in `main.tsx` above `<BrowserRouter>`.
- `src/lib/progress.ts` — Firestore layout `users/{uid}/progress/{questionId}`. `useProgress()` returns a live `ProgressMap`; `recordAttempt()` merge-writes with `serverTimestamp()`; `mergeStatus()` keeps "solved" sticky so a later wrong attempt can't demote it.
- Auth UI lives in `App.tsx` (`AuthButton`): shows `AUTH.OFFLINE` when unconfigured, `SIGN_IN` when signed out, avatar + `SIGN_OUT` when signed in.
- Quiz components write progress: `CodingQuiz.onRun` records `solved` on pass / `wrong` on runtime error / `attempted` on mismatch; `MultipleChoice.check` records `solved` or `wrong`. Both are silent no-ops when signed out, so the app stays fully functional without Firebase.
- Home adds a `TODO / DONE` status segmented control, a green `MODULES_SOLVED` progress bar alongside the filter-match bar, and per-card `DONE` badges + attempt counters.
- Env template in `.env.example`; TypeScript types for `import.meta.env` in `src/vite-env.d.ts`.
- `src/lib/syncStatus.ts` — tiny `useSyncExternalStore`-backed store for the last progress-sync event (`idle | pending | ok | error`). `recordAttempt` emits on each write; `SyncIndicator` in the nav renders `SYNC: OK` / `SYNC: <err>` with a hover title for the full message. Added after a debugging session where permission-denied rule errors and ad-blocker `ERR_BLOCKED_BY_CLIENT` failures were silently swallowed by `console.warn`; now the UI surfaces them in real time.
- `firebase.ts` logs once at startup in dev (`[firebase] configured — project=… authDomain=…`) so env-not-loaded is obvious in the console.

**Milestone 1: scaffold + seed + styled UI** — Done. Local dev works (`npm run dev`), 10 seed questions, coding + MCQ flows functional, brutalist theme applied across Home / CodingQuiz / MultipleChoice, Home has search + filter chips + dense card grid.

## Next milestones

4. Firebase Hosting deploy — wire `npm run deploy`, confirm env-var injection at build time, publish.

## Firestore rules (to configure in Firebase console)

Users should only read/write their own subtree:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Local setup for Firebase

1. Copy `.env.example` → `.env.local` and paste values from Firebase console (Project settings → General → SDK setup & config).
2. Enable Google provider in Firebase Authentication → Sign-in method.
3. Create a Firestore database in production mode with the rules above.
4. `npm run dev` — the nav will switch from `AUTH.OFFLINE` to `SIGN_IN`.

## Troubleshooting sync

If the `SyncIndicator` in the nav shows `SYNC: <err>`:
- **"Missing or insufficient permissions"** — the Firestore rules weren't published, or the default `allow read, write: if false;` is still active. Re-publish the rules above.
- **`ERR_BLOCKED_BY_CLIENT`** (visible in DevTools network tab on `firestore.googleapis.com`) — an ad/tracker blocker (uBlock Origin, Brave Shields, Privacy Badger, etc.) is cancelling the Firestore request before it leaves the browser. Allowlist `firestore.googleapis.com`, `firebaseinstallations.googleapis.com`, and `identitytoolkit.googleapis.com` for localhost.
- **`AUTH.OFFLINE` still showing after editing `.env.local`** — Vite reads env only at startup. Stop and restart `npm run dev`.

## Update policy

Update this file on each major milestone completion so future Claude sessions land with accurate context.
