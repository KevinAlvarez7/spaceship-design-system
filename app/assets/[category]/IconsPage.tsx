import { assetCategories } from '@/assets';
import { AssetGrid } from '@/components/viewer/AssetGrid';

export function IconsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Icons</h1>
        <p className="mt-2 text-sm text-zinc-500">
          SVG icon set. Click a card to toggle light / dark preview background.
        </p>
      </div>
      <AssetGrid assets={assetCategories.icons.assets} emptyCategory={assetCategories.icons.slug} />
    </div>
  );
}
