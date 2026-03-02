import { assetCategories } from '@/assets';
import { AssetGrid } from '@/components/viewer/AssetGrid';

export function AnimationsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Animations</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Animation assets — Lottie, Rive, and SVG animations. Install player packages as needed.
        </p>
      </div>
      <AssetGrid assets={assetCategories.animations.assets} emptyCategory={assetCategories.animations.slug} />
    </div>
  );
}
