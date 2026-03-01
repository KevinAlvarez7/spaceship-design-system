'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TokenSwatchProps {
  cssVar: string;
  name: string;
  description?: string;
}

export function TokenSwatch({ cssVar, name, description }: TokenSwatchProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(`var(${cssVar})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className="group flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left hover:border-zinc-300 hover:shadow-sm transition-all w-full"
      title={`Copy var(${cssVar})`}
    >
      <div
        className="h-10 w-10 flex-shrink-0 rounded-md border border-black/10"
        style={{ background: `var(${cssVar})` }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-zinc-800 truncate">{name}</div>
        <div className="text-xs text-zinc-400 font-mono truncate">{cssVar}</div>
        {description && (
          <div className="text-xs text-zinc-400 mt-0.5 truncate">{description}</div>
        )}
      </div>
      <span className={cn('text-xs flex-shrink-0 transition-opacity', copied ? 'text-green-600 opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100')}>
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  );
}
