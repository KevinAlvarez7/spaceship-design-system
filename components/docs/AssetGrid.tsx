import { type AssetEntry } from '@/assets';
import { AssetCard } from './AssetCard';

interface AssetGridProps {
  assets: AssetEntry[];
  emptyCategory: string;
}

export function AssetGrid({ assets, emptyCategory }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
        <p className="text-sm text-zinc-400">
          No assets yet. Add files to{' '}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">
            public/assets/{emptyCategory}/
          </code>{' '}
          and register them in{' '}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">
            assets/index.ts
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {assets.map(asset => (
        <AssetCard key={asset.filePath} asset={asset} />
      ))}
    </div>
  );
}
