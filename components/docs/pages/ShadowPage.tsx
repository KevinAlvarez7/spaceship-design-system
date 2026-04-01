import { shadowTokens } from '@/tokens';

export function ShadowPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Elevation Scale</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shadowTokens.map(token => (
          <div key={token.cssVar} className="flex flex-col items-center gap-4 p-6 rounded-lg border border-zinc-100 bg-zinc-50">
            <div
              className="h-16 w-16 rounded-xl bg-white"
              style={{ boxShadow: `var(${token.cssVar})` }}
            />
            <div className="text-center">
              <div className="text-sm font-semibold text-zinc-800">{token.name}</div>
              <div className="text-xs font-mono text-zinc-400 mt-0.5">{token.cssVar}</div>
              <div className="text-xs text-zinc-500 mt-1">{token.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
