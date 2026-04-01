import { fontFamilies, fontSizes, fontWeights, lineHeights } from '@/tokens';

function TokenTable({ title, rows }: { title: string; rows: { name: string; cssVar: string; value: string }[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">CSS Var</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map(row => (
              <tr key={row.cssVar} className="bg-white hover:bg-zinc-50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-800">{row.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{row.cssVar}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TypographyPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <TokenTable title="Font Families"   rows={fontFamilies} />
      <TokenTable title="Font Sizes"      rows={fontSizes} />
      <TokenTable title="Font Weights"    rows={fontWeights} />
      <TokenTable title="Line Heights"    rows={lineHeights} />
    </div>
  );
}
