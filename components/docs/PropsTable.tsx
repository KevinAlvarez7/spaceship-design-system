export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export function PropsTable({ props }: { props: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Prop</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Default</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {props.map(row => (
            <tr key={row.name} className="bg-white hover:bg-zinc-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-zinc-800">{row.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-blue-600">{row.type}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-400">{row.default ?? '—'}</td>
              <td className="px-4 py-3 text-xs text-zinc-600">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
