'use client';

import { useRef, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { SpaceshipLogoV2 } from './SpaceshipLogoV2';
import { SpaceshipPlanet } from './SpaceshipPlanet';
import { SpaceshipStar } from './SpaceshipStar';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SceneDecoration {
  /** Any React node — typically <SpaceshipPlanet /> or <SpaceshipStar /> */
  element: React.ReactNode;
  /** Absolute position offsets relative to the logo container (scaled with width) */
  position: { top?: number; right?: number; bottom?: number; left?: number };
  /** If true, renders behind the logo (z-index 5 vs 15). Default: true */
  behind?: boolean;
}

export interface SpaceshipLogoSceneProps {
  width?: number;
  interactive?: boolean;
  fleeRadius?: number;
  maxDisplacement?: number;
  beamDuration?: number;
  beamSkewRange?: number;
  disableMotion?: boolean;
  decorations?: SceneDecoration[];
  className?: string;
}

// ── Default decorations (authored at width=180) ───────────────────────────────

const DEFAULT_DECORATIONS: SceneDecoration[] = [
  // Two stars — above the saucer, behind
  { element: <SpaceshipStar size={20} />,                      position: { top: -16, left: 58 },  behind: true },
  { element: <SpaceshipStar size={14} />,                      position: { top: 0,   left: 78 },  behind: true },
  // Lilac planet — bottom-left, large, behind saucer
  { element: <SpaceshipPlanet color="#C3A8FF" size={32} />,    position: { top: 72, left: -40 },  behind: true },
  // Mint planet — far right, further out to the side
  { element: <SpaceshipPlanet color="#26E6B5" size={20} />,    position: { top: 6,  right: -48 }, behind: true },
];

// ── SpaceshipLogoScene ────────────────────────────────────────────────────────

export function SpaceshipLogoScene({
  width = 180,
  interactive = true,
  fleeRadius = 300,
  maxDisplacement = 100,
  beamDuration = 3,
  beamSkewRange = 15,
  disableMotion = false,
  decorations = DEFAULT_DECORATIONS,
  className,
}: SpaceshipLogoSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for flee physics
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 80, damping: 18 });
  const y = useSpring(rawY, { stiffness: 80, damping: 18 });
  const rotate = useTransform(x, [-maxDisplacement, maxDisplacement], [-30, 30]);

  // Derived dimensions — mirrors SpaceshipLogoV2's sizing math
  const scale = width / 129;
  const saucerH = Math.round(94 * scale);
  const beamH = Math.round(88 * scale);
  const overlapPx = Math.round(38 * scale);
  const totalH = saucerH + beamH - overlapPx;

  // Position scale — all decoration offsets authored at width=180
  const ps = width / 180;

  // Mouse-flee logic
  useEffect(() => {
    if (!interactive || disableMotion) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < fleeRadius) {
        const strength = (fleeRadius - dist) / fleeRadius;
        const fleeX = -(dx / dist) * strength * maxDisplacement;
        const fleeY = -(dy / dist) * strength * maxDisplacement;
        rawX.set(Math.max(-maxDisplacement, Math.min(maxDisplacement, fleeX)));
        rawY.set(Math.max(-maxDisplacement, Math.min(maxDisplacement, fleeY)));
      } else {
        rawX.set(0);
        rawY.set(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, disableMotion, fleeRadius, maxDisplacement, rawX, rawY]);

  const behindDecorations = decorations.filter(d => d.behind !== false);
  const frontDecorations = decorations.filter(d => d.behind === false);

  function renderDecoration(d: SceneDecoration, i: number, zIndex: number) {
    const pos = d.position;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          zIndex,
          top:    pos.top    !== undefined ? pos.top    * ps : undefined,
          right:  pos.right  !== undefined ? pos.right  * ps : undefined,
          bottom: pos.bottom !== undefined ? pos.bottom * ps : undefined,
          left:   pos.left   !== undefined ? pos.left   * ps : undefined,
        }}
      >
        {d.element}
      </div>
    );
  }

  if (disableMotion) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width, height: totalH, position: 'relative', overflow: 'visible' }}
      >
        {behindDecorations.map((d, i) => renderDecoration(d, i, 5))}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <SpaceshipLogoV2
            width={width}
            interactive={false}
            beamDuration={beamDuration}
            beamSkewRange={beamSkewRange}
            disableMotion={disableMotion}
          />
        </div>
        {frontDecorations.map((d, i) => renderDecoration(d, i, 15))}
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{ x, y, rotate, width, height: totalH, position: 'relative', overflow: 'visible' }}
    >
      {behindDecorations.map((d, i) => renderDecoration(d, i, 5))}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <SpaceshipLogoV2
          width={width}
          interactive={false}
          beamDuration={beamDuration}
          beamSkewRange={beamSkewRange}
          disableMotion={disableMotion}
        />
      </div>
      {frontDecorations.map((d, i) => renderDecoration(d, i, 15))}
    </motion.div>
  );
}
