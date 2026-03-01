import { TokenSwatch } from '@/components/viewer/TokenSwatch';
import { colorPrimitives, colorSemantic } from '@/tokens';

export function ColorPage() {
  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Primitives</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Raw palette values. Never reference these directly in components — use semantic tokens.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {colorPrimitives.map(token => (
            <TokenSwatch key={token.cssVar} {...token} />
          ))}
        </div>
      </div>

      {colorSemantic.map(group => (
        <div key={group.group}>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">{group.group}</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.tokens.map(token => (
              <TokenSwatch key={token.cssVar} {...token} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
