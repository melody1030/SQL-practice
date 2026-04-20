import type { TablePreview } from '../db/sqlEngine';

export default function SchemaTable({ table }: { table: TablePreview }) {
  return (
    <div className="border border-zinc-950/10 bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 text-stone-50">
        <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
          {table.name}
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-50/60">
          {table.rows.length} ROW{table.rows.length === 1 ? '' : 'S'} ·{' '}
          {table.columns.length} COL
        </span>
      </div>
      <div className="overflow-auto">
        {table.columns.length === 0 ? (
          <div className="p-4 text-[11px] font-mono text-zinc-400">(empty)</div>
        ) : (
          <table className="w-full text-left text-[11px] font-mono border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-950 bg-blue-50/60">
                {table.columns.map((c) => (
                  <th
                    key={c}
                    className="px-3 py-2 font-mono font-bold text-blue-900 uppercase tracking-wider whitespace-nowrap text-[10px]"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-100 last:border-0 hover:bg-stone-50"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-3 py-2 font-bold text-zinc-700 whitespace-nowrap"
                    >
                      {cell === null ? (
                        <span className="text-zinc-400">NULL</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
