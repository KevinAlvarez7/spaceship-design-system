import { lazy, Suspense } from 'react';
import { type AssetEntry } from '@/assets';

const LottiePlayer = lazy(() => import('./players/LottiePlayer'));
const RivePlayer = lazy(() => import('./players/RivePlayer'));

interface AnimationPlayerProps {
  asset: AssetEntry;
}

function AnimationFallback({ label }: { label: string }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded border border-dashed border-zinc-300">
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

export function AnimationPlayer({ asset }: AnimationPlayerProps) {
  if (asset.format === 'lottie') {
    return <Suspense fallback={<AnimationFallback label="Loading Lottie…" />}><LottiePlayer src={asset.filePath} /></Suspense>;
  }

  if (asset.format === 'rive') {
    return <Suspense fallback={<AnimationFallback label="Loading Rive…" />}><RivePlayer src={asset.filePath} /></Suspense>;
  }

  if (asset.format === 'svg-anim') {
    return (
      <img
        src={asset.filePath}
        alt={asset.name}
        className="max-h-20 max-w-full object-contain"
        width={asset.dimensions?.width}
        height={asset.dimensions?.height}
      />
    );
  }

  return <AnimationFallback label="Unknown format" />;
}
