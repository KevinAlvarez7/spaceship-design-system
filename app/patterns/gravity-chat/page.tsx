'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { GravityWell } from '@/components/effects/GravityWell/GravityWell';
import { ChatInputBox } from '@/components/ui';

type Mode = 'idle' | 'blackHole';
type Source = { x: number; y: number; mass?: number };

export default function GravityChatPlayground() {
  const [mode, setMode] = useState<Mode>('idle');
  const modeRef = useRef<Mode>('idle');

  const containerRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<Source[] | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputCenterRef = useRef({ x: 0, y: 0 });

  const circleControls = useAnimation();

  // Sync modeRef + drive circle animation + restore idle source on mode change
  useEffect(() => {
    modeRef.current = mode;
    if (mode === 'idle') {
      (sourcesRef as { current: Source[] | null }).current = [
        { x: inputCenterRef.current.x, y: inputCenterRef.current.y, mass: 6 },
      ];
      circleControls.start({
        scale: 1,
        opacity: 1,
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      });
    } else {
      circleControls.start({
        scale: 0,
        opacity: 0,
        transition: { type: 'spring', stiffness: 400, damping: 28 },
      });
    }
  }, [mode, circleControls]);

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
      if (modeRef.current === 'idle') {
        (sourcesRef as { current: Source[] | null }).current = [
          { x: inputCenterRef.current.x, y: inputCenterRef.current.y, mass: 6 },
        ];
      }
    }

    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-hidden${mode === 'blackHole' ? ' cursor-none' : ''}`}
    >
      <GravityWell
        sourcesRef={sourcesRef}
        softness={150}
      />

      {/* Positioned stack: circle logo above ChatInputBox */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-[520px]">
        {/* Circle logo — easter egg trigger */}
        <motion.div
          animate={circleControls}
          initial={{ scale: 1, opacity: 1 }}
          whileHover={mode === 'idle' ? { scale: 0.6, transition: { type: 'spring', stiffness: 400, damping: 28 } } : undefined}
          className="w-10 h-10 rounded-full border-[1.5px] border-zinc-700 cursor-pointer"
          onHoverStart={() => { if (mode === 'idle') setMode('blackHole'); }}
        />

        {/* ChatInputBox wrapper — resets to idle when cursor enters */}
        <div
          ref={inputWrapperRef}
          className="w-full"
          onMouseEnter={() => { if (mode === 'blackHole') setMode('idle'); }}
        >
          <ChatInputBox placeholder="Explore any problems, prototype any ideas..." />
        </div>
      </div>
    </div>
  );
}
