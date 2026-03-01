import { spacingTokens } from '@/tokens';

export function SpacingPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Spacing Scale</h2>
      <div className="space-y-3">
        {spacingTokens.map(token => (
          <div key={token.cssVar} className="flex items-center gap-4">
            <div className="w-20 text-xs font-mono text-zinc-400 flex-shrink-0">{token.pxValue}</div>
            <div className="w-28 text-xs font-mono text-zinc-400 flex-shrink-0">{token.cssVar}</div>
            <div className="h-4 rounded-sm bg-blue-200 flex-shrink-0" style={{ width: `var(${token.cssVar})` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
