'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type IconEntry, ICON_SIZES } from '@/assets/lucide-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shadcn/tooltip';
import { Badge } from '@/components/shadcn/badge';

interface LucideIconCardProps {
  entry: IconEntry;
}

export function LucideIconCard({ entry }: LucideIconCardProps) {
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `import { ${entry.importName} } from 'lucide-react';`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (non-secure context or permission denied)
    }
  }

  const Icon = entry.icon;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      {/* Preview — click to toggle light/dark background */}
      <button
        onClick={() => setDark(d => !d)}
        title="Toggle light / dark background"
        className={cn(
          'flex w-full items-center justify-around px-4 py-5 transition-colors',
          dark ? 'bg-zinc-900' : 'bg-zinc-50'
        )}
      >
        {ICON_SIZES.map(({ label, size, strokeWidth }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <Icon
              style={{ width: size, height: size }}
              strokeWidth={strokeWidth}
              className={dark ? 'text-white' : 'text-zinc-800'}
            />
            <span className="text-[10px] leading-none text-zinc-400">
              {size}
            </span>
            <span className={cn('text-[10px] leading-none', dark ? 'text-zinc-400/70' : 'text-zinc-500')}>
              sw:{strokeWidth}
            </span>
          </div>
        ))}
      </button>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-zinc-800">{entry.name}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
              >
                {copied
                  ? <Check className="h-3.5 w-3.5 text-green-600" />
                  : <Copy className="h-3.5 w-3.5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 text-white border-zinc-800 text-xs">
              Copy import statement
            </TooltipContent>
          </Tooltip>
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {entry.tags.map(tag => (
              <Badge key={tag} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-normal text-zinc-500 border-transparent hover:bg-zinc-100">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
