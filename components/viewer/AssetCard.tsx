'use client';

import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AssetEntry } from '@/assets';
import { AnimationPlayer } from './AnimationPlayer';

interface AssetCardProps {
  asset: AssetEntry;
}

export function AssetCard({ asset }: AssetCardProps) {
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    let text = asset.filePath;
    if (asset.format === 'svg' || asset.format === 'svg-anim') {
      try {
        const res = await fetch(asset.filePath);
        text = await res.text();
      } catch {
        // fall back to path if fetch fails
      }
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    const a = document.createElement('a');
    a.href = asset.filePath;
    a.download = asset.name;
    a.click();
  }

  const isAnimation = ['lottie', 'rive', 'svg-anim'].includes(asset.format);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      {/* Preview — click to toggle light/dark background */}
      <button
        onClick={() => setDark(d => !d)}
        title="Toggle light / dark background"
        className={cn(
          'relative flex min-h-32 w-full items-center justify-center p-6 transition-colors',
          dark ? 'bg-zinc-900' : 'bg-zinc-50'
        )}
      >
        {isAnimation ? (
          <AnimationPlayer asset={asset} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.filePath}
            alt={asset.name}
            className="max-h-20 max-w-full object-contain"
            width={asset.dimensions?.width}
            height={asset.dimensions?.height}
          />
        )}
      </button>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-zinc-800">{asset.name}</span>
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              onClick={handleCopy}
              title={asset.format === 'svg' || asset.format === 'svg-anim' ? 'Copy SVG' : 'Copy path'}
              className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              {copied
                ? <Check className="h-3.5 w-3.5 text-green-600" />
                : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleDownload}
              title="Download"
              className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {asset.description && (
          <p className="mt-0.5 truncate text-xs text-zinc-400">{asset.description}</p>
        )}
        {asset.tags && asset.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {asset.tags.map(tag => (
              <span key={tag} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
