'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ColorPrimitiveToken } from '@spaceship/design-system';

function PaletteSwatch({ token }: { token: ColorPrimitiveToken }) {
  const [copied, setCopied] = useState(false);

  // Extract trailing number (e.g. "orbit-blue-500" → "500") or fall back to full name
  const shade = token.name.match(/(\d+)$/)?.[1] ?? token.name;

  function copy() {
    navigator.clipboard.writeText(`var(${token.cssVar})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className="group flex flex-col items-center gap-1.5 min-w-0"
      title={`Copy var(${token.cssVar})`}
    >
      <div
        className="h-10 w-full rounded-md border border-black/10 transition-all group-hover:ring-2 group-hover:ring-offset-1 group-hover:ring-zinc-400"
        style={{ background: `var(${token.cssVar})` }}
      />
      <span className={cn('text-xs font-mono', copied ? 'text-green-600' : 'text-zinc-400')}>
        {copied ? 'Copied' : shade}
      </span>
    </button>
  );
}

interface ColorPaletteRowProps {
  scale: string;
  tokens: ColorPrimitiveToken[];
}

export function ColorPaletteRow({ scale, tokens }: ColorPaletteRowProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-32 flex-shrink-0 pt-2.5">
        <span className="text-sm font-medium text-zinc-800">{scale}</span>
      </div>
      <div
        className="grid flex-1 gap-1.5"
        style={{ gridTemplateColumns: `repeat(${tokens.length}, minmax(0, 1fr))` }}
      >
        {tokens.map(token => (
          <PaletteSwatch key={token.cssVar} token={token} />
        ))}
      </div>
    </div>
  );
}
