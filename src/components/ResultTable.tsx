import type { QueryResult } from '../db/sqlEngine';

export default function ResultTable({
  result,
  caption,
}: {
  result: QueryResult;
  caption?: string;
}) {
  if (result.columns.length === 0) {
    return (
      <div className="text-sm text-neutral-500 italic">No rows returned.</div>
    );
  }
  return (
    <div className="overflow-auto border border-neutral-200 rounded-lg">
      {caption && (
        <div className="px-3 py-2 text-xs uppercase tracking-wide text-neutral-500 bg-neutral-50 border-b border-neutral-200">
          {caption}
        </div>
      )}
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600">
          <tr>
            {result.columns.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className="border-t border-neutral-100">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 font-mono text-neutral-800">
                  {cell === null ? (
                    <span className="text-neutral-400">NULL</span>
                  ) : (
                    String(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
