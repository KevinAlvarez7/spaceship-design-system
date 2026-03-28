import { radiusTokens } from '@spaceship/design-system';

export function RadiusPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Border Radius Scale</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {radiusTokens.map(token => (
          <div key={token.name} className="flex flex-col items-center gap-3 p-4 rounded-lg border border-zinc-200 bg-white">
            <div
              className="h-14 w-14 bg-blue-100 border-2 border-blue-300"
              style={{ borderRadius: token.value }}
            />
            <div className="text-center">
              <div className="text-sm font-medium text-zinc-800">{token.name}</div>
              <div className="text-xs font-mono text-zinc-400">{token.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
