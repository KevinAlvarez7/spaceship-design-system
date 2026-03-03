'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type IconEntry } from '@/assets/lucide-icons';

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
          'relative flex min-h-32 w-full items-center justify-center p-6 transition-colors',
          dark ? 'bg-zinc-900' : 'bg-zinc-50'
        )}
      >
        <Icon className={cn('h-8 w-8', dark ? 'text-white' : 'text-zinc-800')} />
      </button>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-zinc-800">{entry.name}</span>
          <button
            onClick={handleCopy}
            title="Copy import statement"
            className="flex-shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            {copied
              ? <Check className="h-3.5 w-3.5 text-green-600" />
              : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {entry.tags.map(tag => (
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
