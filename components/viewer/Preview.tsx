'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Surface = 'white' | 'subtle' | 'dark';

const surfaces: Record<Surface, { label: string; className: string }> = {
  white:  { label: 'White',  className: 'bg-white' },
  subtle: { label: 'Subtle', className: 'bg-zinc-50' },
  dark:   { label: 'Dark',   className: 'bg-zinc-900' },
};

interface PreviewProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export function Preview({ children, className, label }: PreviewProps) {
  const [surface, setSurface] = useState<Surface>('white');

  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2">
        <span className="text-xs text-zinc-400">{label ?? 'Preview'}</span>
        <div className="flex items-center gap-1">
          {(Object.keys(surfaces) as Surface[]).map(s => (
            <button
              key={s}
              onClick={() => setSurface(s)}
              className={cn(
                'rounded px-2 py-1 text-xs transition-colors',
                surface === s
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200 font-medium'
                  : 'text-zinc-500 hover:text-zinc-700'
              )}
            >
              {surfaces[s].label}
            </button>
          ))}
        </div>
      </div>
      <div
        className={cn(
          'relative min-h-32 p-8',
          surfaces[surface].className,
          '[background-image:radial-gradient(circle,_#d4d4d8_1px,_transparent_1px)]',
          '[background-size:20px_20px]',
          className
        )}
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}
