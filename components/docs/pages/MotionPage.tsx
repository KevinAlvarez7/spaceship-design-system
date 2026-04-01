import {
  durationTokens, easingTokens,
  springPresetTokens, scalePresetTokens,
  type FramerMotionToken,
} from '@/tokens';

function SimpleTable({ title, rows }: { title: string; rows: { name: string; cssVar: string; value: string }[] }) {
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
            {rows.map(t => (
              <tr key={t.cssVar} className="bg-white hover:bg-zinc-50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-800">{t.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{t.cssVar}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{t.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FramerTable({ title, rows }: { title: string; rows: FramerMotionToken[] }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-zinc-900 mb-3">{title}</h3>
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Used By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map(t => (
              <tr key={t.name} className="bg-white hover:bg-zinc-50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-800">{t.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{t.value}</td>
                <td className="px-4 py-3 text-xs text-zinc-500">{t.usedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MotionPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <SimpleTable title="Duration" rows={durationTokens} />
      <SimpleTable title="Easing"   rows={easingTokens} />
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-zinc-900">Framer Motion</h2>
        <FramerTable title="Spring Presets" rows={springPresetTokens} />
        <FramerTable title="Scale Presets"  rows={scalePresetTokens} />
      </div>
    </div>
  );
}
