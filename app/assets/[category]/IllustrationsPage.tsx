import { assetCategories } from '@/assets';
import { AssetGrid } from '@/components/viewer/AssetGrid';

export function IllustrationsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Illustrations</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Illustration assets. Click a card to toggle light / dark preview background.
        </p>
      </div>
      <AssetGrid assets={assetCategories.illustrations.assets} emptyCategory={assetCategories.illustrations.slug} />
    </div>
  );
}
