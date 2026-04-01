'use client';

import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

type Viewport = 'desktop' | 'phone';

interface PlaygroundViewportWrapperProps {
  children: React.ReactNode;
}

export function PlaygroundViewportWrapper({ children }: PlaygroundViewportWrapperProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  return (
    <div className={cn('relative h-screen w-screen', viewport === 'phone' && 'bg-zinc-50')}>
      {/* Viewport toggle widget */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
        <button
          onClick={() => setViewport('desktop')}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            viewport === 'desktop'
              ? 'bg-zinc-100 text-zinc-900'
              : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700'
          )}
          title="Desktop view"
        >
          <Monitor className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setViewport('phone')}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            viewport === 'phone'
              ? 'bg-zinc-100 text-zinc-900'
              : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700'
          )}
          title="Phone view"
        >
          <Smartphone className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Stable tree: same shape for both viewports — prevents prototype remount on toggle */}
      <div className={cn('h-full w-full', viewport === 'phone' && 'flex items-center justify-center')}>
        <div
          className={cn(viewport === 'phone' && 'overflow-hidden rounded-[2.5rem] border-10 border-zinc-200')}
          style={viewport === 'phone' ? { width: 410, height: 864 } : { width: '100%', height: '100%' }}
        >
          <div
            className="h-full w-full"
            style={viewport === 'phone' ? { width: 390, height: 844, overflow: 'auto' } : undefined}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
