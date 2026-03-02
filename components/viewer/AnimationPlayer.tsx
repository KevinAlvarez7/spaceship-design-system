import dynamic from 'next/dynamic';
import { type AssetEntry } from '@/assets';

const LottiePlayer = dynamic(() => import('./players/LottiePlayer'), {
  ssr: false,
  loading: () => <AnimationFallback label="Loading Lottie…" />,
});

const RivePlayer = dynamic(() => import('./players/RivePlayer'), {
  ssr: false,
  loading: () => <AnimationFallback label="Loading Rive…" />,
});

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
    return <LottiePlayer src={asset.filePath} />;
  }

  if (asset.format === 'rive') {
    return <RivePlayer src={asset.filePath} />;
  }

  if (asset.format === 'svg-anim') {
    // eslint-disable-next-line @next/next/no-img-element
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
