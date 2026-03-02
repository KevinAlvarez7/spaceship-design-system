'use client';

import { useRef, useEffect, useState, type MutableRefObject } from 'react';
import { motion, useAnimation, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { GravityWell } from '@/components/effects/GravityWell/GravityWell';
import { ChatInputBox } from '@/components/ui';

type Mode = 'idle' | 'blackHole';
type Source = { x: number; y: number; mass?: number };

export default function GravityChatPlayground() {
  const [mode, setMode] = useState<Mode>('idle');
  const modeRef = useRef<Mode>('idle');

  const containerRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<Source[] | null>(null) as MutableRefObject<Source[] | null>;
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputCenterRef = useRef({ x: 0, y: 0 });

  const circleControls = useAnimation();
  const idleCooldownRef = useRef(false);

  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 35 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 35 });

  // Sync modeRef + drive circle animation + restore idle source on mode change
  useEffect(() => {
    modeRef.current = mode;
    if (mode === 'idle') {
      sourcesRef.current = [
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

  // Cooldown after idle transition — prevents circle immediately re-triggering
  useEffect(() => {
    if (mode !== 'idle') return;
    idleCooldownRef.current = true;
    const timer = setTimeout(() => { idleCooldownRef.current = false; }, 400);
    return () => clearTimeout(timer);
  }, [mode]);

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
        sourcesRef.current = [
          { x: inputCenterRef.current.x, y: inputCenterRef.current.y, mass: 6 },
        ];
      }
    }

    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  // Global mouse tracking — feeds cursor motion values + dual sources in blackHole mode
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (modeRef.current !== 'blackHole') return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      sourcesRef.current = [
        { x: inputCenterRef.current.x, y: inputCenterRef.current.y, mass: 6 },
        { x: e.clientX - rect.left, y: e.clientY - rect.top, mass: 10 },
      ];
    }
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [cursorX, cursorY]);

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-hidden${mode === 'blackHole' ? ' cursor-none' : ''}`}
    >
      <GravityWell
        sourcesRef={sourcesRef}
        softness={150}
      />

      <AnimatePresence>
        {mode === 'blackHole' && (
          <motion.div
            key="blackhole-cursor"
            className="pointer-events-none fixed z-50 w-4 h-4 rounded-full"
            style={{
              x: springX,
              y: springY,
              translateX: '-50%',
              translateY: '-50%',
              background: 'radial-gradient(circle, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.3) 60%, transparent 100%)',
              boxShadow: '0 0 0 1.5px rgba(9,9,11,0.8), 0 0 14px rgba(9,9,11,0.15)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          />
        )}
      </AnimatePresence>

      {/* Positioned stack: circle logo above ChatInputBox */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-[520px]">
        {/* Circle logo — easter egg trigger */}
        <motion.div
          animate={circleControls}
          initial={{ scale: 1, opacity: 1 }}
          whileHover={mode === 'idle' ? { scale: 0.6, transition: { type: 'spring', stiffness: 400, damping: 28 } } : undefined}
          className="w-10 h-10 rounded-full border-[1.5px] border-zinc-700 cursor-pointer"
          onHoverStart={() => { if (mode === 'idle' && !idleCooldownRef.current) setMode('blackHole'); }}
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
