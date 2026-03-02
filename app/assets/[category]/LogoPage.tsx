import { assetCategories } from '@/assets';
import { AssetGrid } from '@/components/viewer/AssetGrid';

export function LogoPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Logo</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Official logo files. Click a card to toggle light / dark preview background.
        </p>
      </div>
      <AssetGrid assets={assetCategories.logo.assets} emptyCategory={assetCategories.logo.slug} />
    </div>
  );
}
