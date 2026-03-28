import { TokenSwatch } from '@/components/viewer/TokenSwatch';
import { ColorPaletteRow } from '@/components/viewer/ColorPaletteRow';
import { colorPrimitives, colorSemantic } from '@spaceship/design-system';
import type { ColorToken } from '@spaceship/design-system';
import { buildSemanticTree } from '@/lib/buildSemanticTree';
import type { SemanticTreeNode, SemanticChild } from '@/lib/buildSemanticTree';

function TokenGrid({ tokens }: { tokens: ColorToken[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map(token => (
        <TokenSwatch key={token.cssVar} {...token} />
      ))}
    </div>
  );
}

function ChildSection({ child }: { child: SemanticChild }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 mb-3">{child.label}</h3>
      {child.tokens.length > 0 && <TokenGrid tokens={child.tokens} />}
      {child.children.length > 0 && (
        <div className="pl-4 border-l-2 border-zinc-100 mt-3 space-y-4">
          {child.children.map(grandchild => (
            <div key={grandchild.label}>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                {grandchild.label}
              </h4>
              <TokenGrid tokens={grandchild.tokens} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SemanticGroupSection({ node }: { node: SemanticTreeNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">{node.parent}</h2>
      {node.tokens.length > 0 && <TokenGrid tokens={node.tokens} />}
      {node.children.length > 0 && (
        <div className="pl-4 border-l-2 border-zinc-100 mt-4 space-y-6">
          {node.children.map(child => (
            <ChildSection key={child.label} child={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ColorPage() {
  const scales = colorPrimitives.reduce<Record<string, typeof colorPrimitives>>((acc, token) => {
    if (!acc[token.scale]) acc[token.scale] = [];
    acc[token.scale].push(token);
    return acc;
  }, {});

  const semanticTree = buildSemanticTree(colorSemantic);

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Primitives</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Raw palette values. Never reference these directly in components — use semantic tokens.
        </p>
        <div className="space-y-3">
          {Object.entries(scales).map(([scale, tokens]) => (
            <ColorPaletteRow key={scale} scale={scale} tokens={tokens} />
          ))}
        </div>
      </div>

      {semanticTree.map(node => (
        <SemanticGroupSection key={node.parent} node={node} />
      ))}
    </div>
  );
}
