'use client';

import { useRef, useEffect } from 'react';
import { GravityWell } from '@/components/effects/GravityWell/GravityWell';
import { ChatInputBox } from '@/components/ui';

type Source = { x: number; y: number; mass?: number };

export default function GravityChatPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<Source[] | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputCenterRef = useRef({ x: 0, y: 0 });

  // Track input box center in canvas-local coords; update static source
  useEffect(() => {
    function updateCenter() {
      if (!inputWrapperRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const inputRect = inputWrapperRef.current.getBoundingClientRect();
      inputCenterRef.current = {
        x: inputRect.left + inputRect.width / 2 - containerRect.left,
        y: inputRect.top + inputRect.height / 2 - containerRect.top,
      };
      (sourcesRef as { current: Source[] | null }).current = [
        { x: inputCenterRef.current.x, y: inputCenterRef.current.y, mass: 6 },
      ];
    }

    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

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
        <div ref={inputWrapperRef} className="w-full">
          <ChatInputBox placeholder="Explore any problems, prototype any ideas..." />
        </div>
      </div>
    </div>
  );
}
