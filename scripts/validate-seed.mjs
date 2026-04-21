// Sanity-check every coding question: schemaSql + expectedSql must execute
// in SQLite and return >= 1 column. Catches typos and non-SQLite syntax.
//
// Usage:  node scripts/validate-seed.mjs
import initSqlJs from 'sql.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { build } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const seedPath = resolve(here, '../src/questions/seed.ts');

// Bundle the TS seed to a temp JS we can import.
const { outputFiles } = await build({
  entryPoints: [seedPath],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  target: 'es2020',
});
const js = outputFiles[0].text;
const dataUrl =
  'data:text/javascript;base64,' + Buffer.from(js).toString('base64');
const { seedQuestions } = await import(dataUrl);

const SQL = await initSqlJs({
  locateFile: (f) => resolve(here, '../node_modules/sql.js/dist/' + f),
});

let pass = 0;
let fail = 0;
for (const q of seedQuestions) {
  if (q.type !== 'coding') continue;
  const db = new SQL.Database();
  try {
    db.exec(q.schemaSql);
    const res = db.exec(q.expectedSql);
    if (!res.length || !res[0].columns?.length) {
      console.error(`✗ ${q.id} "${q.title}" — expectedSql returned no columns`);
      fail++;
    } else {
      console.log(
        `✓ ${q.id} "${q.title}" — ${res[0].columns.length} cols, ${res[0].values.length} rows`,
      );
      pass++;
    }
  } catch (e) {
    console.error(`✗ ${q.id} "${q.title}" — ${e.message}`);
    fail++;
  } finally {
    db.close();
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
