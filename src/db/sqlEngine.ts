// Import the CJS build explicitly — the package's `browser` export is UMD
// without a default ESM export, which breaks Vite's transform.
import initSqlJs from 'sql.js/dist/sql-wasm.js';
import type { Database, SqlJsStatic } from 'sql.js';

let sqlPromise: Promise<SqlJsStatic> | null = null;

function getSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
  }
  return sqlPromise;
}

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
}

export interface RunOutcome {
  ok: boolean;
  error?: string;
  user?: QueryResult;
  expected?: QueryResult;
  match?: boolean;
}

function execToResult(db: Database, sql: string): QueryResult {
  const res = db.exec(sql);
  if (res.length === 0) return { columns: [], rows: [] };
  const last = res[res.length - 1];
  return {
    columns: last.columns,
    rows: last.values.map((row) =>
      row.map((v) => (v === null || v === undefined ? null : (v as any))),
    ),
  };
}

function normalizeRows(rows: (string | number | null)[][], sort: boolean) {
  const serialized = rows.map((r) => r.map((c) => (c === null ? '∅' : String(c))));
  if (sort) {
    serialized.sort((a, b) => a.join('\u0001').localeCompare(b.join('\u0001')));
  }
  return serialized;
}

function compare(user: QueryResult, expected: QueryResult, orderMatters: boolean) {
  if (user.columns.length !== expected.columns.length) return false;
  if (user.rows.length !== expected.rows.length) return false;
  const u = normalizeRows(user.rows, !orderMatters);
  const e = normalizeRows(expected.rows, !orderMatters);
  for (let i = 0; i < u.length; i++) {
    for (let j = 0; j < u[i].length; j++) {
      if (u[i][j] !== e[i][j]) return false;
    }
  }
  return true;
}

export interface TablePreview {
  name: string;
  columns: string[];
  rows: (string | number | null)[][];
  createSql: string;
}

export async function previewSchema(schemaSql: string): Promise<TablePreview[]> {
  const SQL = await getSql();
  const db = new SQL.Database();
  try {
    db.exec(schemaSql);
    const tablesRes = db.exec(
      "SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name",
    );
    if (tablesRes.length === 0) return [];
    const tables = tablesRes[0].values as [string, string][];
    const previews: TablePreview[] = [];
    for (const [name, createSql] of tables) {
      const r = db.exec(`SELECT * FROM "${name}"`);
      if (r.length === 0) {
        previews.push({ name, columns: [], rows: [], createSql });
      } else {
        previews.push({
          name,
          columns: r[0].columns,
          rows: r[0].values.map((row) =>
            row.map((v) => (v === null || v === undefined ? null : (v as any))),
          ),
          createSql,
        });
      }
    }
    return previews;
  } finally {
    db.close();
  }
}

export async function runCoding(
  schemaSql: string,
  userSql: string,
  expectedSql: string,
  orderMatters = false,
): Promise<RunOutcome> {
  try {
    const SQL = await getSql();
    const db = new SQL.Database();
    db.exec(schemaSql);

    let expected: QueryResult;
    try {
      expected = execToResult(db, expectedSql);
    } catch (e: any) {
      db.close();
      return { ok: false, error: `Reference query failed: ${e.message ?? e}` };
    }

    let user: QueryResult;
    try {
      user = execToResult(db, userSql);
    } catch (e: any) {
      db.close();
      return { ok: false, error: e.message ?? String(e), expected };
    }

    const match = compare(user, expected, orderMatters);
    db.close();
    return { ok: true, user, expected, match };
  } catch (e: any) {
    return { ok: false, error: e.message ?? String(e) };
  }
}
