'use client';

import { useRef, useEffect, useState, type MutableRefObject } from 'react';
import { motion, useAnimation, useMotionValue, useSpring } from 'motion/react';
import { GravityWell, SpaceshipLogoScene, BlackHoleCursor } from '@/components/effects';
import { ChatInputBox } from '@/components/ui';

type Mode = 'idle' | 'blackHole';
type Source = { x: number; y: number; mass?: number };

export function GravityChatPage() {
  const [mode, setMode] = useState<Mode>('idle');
  const modeRef = useRef<Mode>('idle');

  const containerRef = useRef<HTMLDivElement>(null);
  // useRef(null) returns RefObject (readonly .current) in React 18+ types; cast to write directly.
  const sourcesRef = useRef<Source[] | null>(null) as MutableRefObject<Source[] | null>;
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const triggerCenterRef = useRef({ x: 0, y: 0 });

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
      sourcesRef.current = [];
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

  // Track SpaceshipLogo center in canvas-local coords; update static source
  useEffect(() => {
    function updateCenter() {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      if (triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        triggerCenterRef.current = {
          x: triggerRect.left + triggerRect.width / 2 - containerRect.left,
          y: triggerRect.top + triggerRect.height / 2 - containerRect.top,
        };
      }

      if (modeRef.current === 'idle') {
        sourcesRef.current = [];
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
        cols={72}
        rows={50}
        radius={140}
        softness={40}
        showMass={false}
        colorSensitivity={0.2}
        attractStrength={0}
        repelStrength={60}
        disableMouse={mode === 'idle'}
        // lineColorBase="var(--neutral-100)"
        // lineColorActive="var(--neutral-200)"
        lineColors={[
          'var(--solar-coral-300)',
          'var(--lumen-yellow-300)',
          'var(--nova-mint-300)',
          'var(--orbit-blue-300)',
          'var(--cosmic-lilac-300)',
        ]}
      />

      <BlackHoleCursor x={springX} y={springY} isVisible={mode === 'blackHole'} />

      {/* Positioned stack: spaceship logo, heading, ChatInputBox — centered in viewport */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-6 w-full max-w-(--sizing-chat-max) pointer-events-none">
          {/* Spaceship logo — easter egg trigger (catch the ship!) */}
          <motion.div
            ref={triggerRef}
            animate={circleControls}
            initial={{ scale: 1, opacity: 1 }}
            className="pointer-events-auto relative"
          >
            <SpaceshipLogoScene
              width={110}
              interactive
              maxDisplacement={60}
              fleeRadius={200}
            />
            {/* Saucer-sized hit zone — blackHole triggers only when cursor touches the disc */}
            <div
              className="absolute"
              style={{ top: 19, left: 7, width: 96, height: 44 }}
              onMouseEnter={() => {
                if (mode === 'idle' && !idleCooldownRef.current) setMode('blackHole');
              }}
            />
          </motion.div>

          <h1 className="font-serif text-(length:--font-size-4xl) [font-weight:var(--font-weight-bold)] leading-(--line-height-4xl) text-text-primary text-center">
            What ideas do you want to explore?
          </h1>

          {/* ChatInputBox wrapper — resets to idle when cursor enters */}
          <div
            ref={inputWrapperRef}
            className="w-full pointer-events-auto"
            onMouseEnter={() => { if (mode === 'blackHole') setMode('idle'); }}
          >
            <ChatInputBox size="md" placeholder="Explore any problems, prototype any ideas..." />
          </div>
        </div>
      </div>
    </div>
  );
}
