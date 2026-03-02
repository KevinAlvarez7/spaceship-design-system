'use client';

import { useRef } from 'react';
import { GravityWell } from '@/components/effects/GravityWell/GravityWell';
import { ChatInputBox } from '@/components/ui';

type Source = { x: number; y: number; mass?: number };

export default function GravityChatPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<Source[] | null>(null);

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden">
      <GravityWell
        sourcesRef={sourcesRef}
        softness={150}
      />

      {/* Positioned stack: circle logo above ChatInputBox */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-[520px]">
        {/* Circle logo — will become motion.div in Task 4 */}
        <div className="w-10 h-10 rounded-full border-[1.5px] border-zinc-700" />

        {/* ChatInputBox wrapper — reset trigger added in Task 4 */}
        <div className="w-full">
          <ChatInputBox placeholder="Explore any problems, prototype any ideas..." />
        </div>
      </div>
    </div>
  );
}
