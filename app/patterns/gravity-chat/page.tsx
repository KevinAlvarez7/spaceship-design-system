'use client';

import { useRef } from 'react';
import { GravityWell } from '@/components/effects/GravityWell/GravityWell';

type Source = { x: number; y: number; mass?: number };

export default function GravityChatPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<Source[] | null>([]);

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden">
      <GravityWell
        sourcesRef={sourcesRef as React.RefObject<Source[] | null>}
        softness={150}
      />
    </div>
  );
}
