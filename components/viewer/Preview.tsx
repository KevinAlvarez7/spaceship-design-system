'use client';

import { useState } from 'react';
import { RotateCw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  onOpenInNewTab?: () => void;
  justify?: 'start' | 'center';
}

const buttonClass =
  'inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 transition-colors shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]';

export function Preview({ children, className, label, onOpenInNewTab, justify = 'center' }: PreviewProps) {
  const [remountKey, setRemountKey] = useState(0);

  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-3">
        <span className="text-lg font-bold text-zinc-900">{label ?? 'Preview'}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRemountKey(k => k + 1)}
            className={buttonClass}
            aria-label="Refresh preview"
          >
            <RotateCw className="h-4 w-4" />
            Refresh
          </button>
          {onOpenInNewTab && (
            <button
              onClick={onOpenInNewTab}
              className={buttonClass}
              aria-label="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
              Open in new tab
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        key={remountKey}
        className={cn(
          'relative min-h-32 p-8 bg-white',
          '[background-image:radial-gradient(circle,_#d4d4d8_1px,_transparent_1px)]',
          '[background-size:20px_20px]',
          className
        )}
      >
        <div className={cn('flex flex-wrap items-center gap-4 h-full', justify === 'start' ? 'justify-start' : 'justify-center')}>
          {children}
        </div>
      </div>
    </div>
  );
}
