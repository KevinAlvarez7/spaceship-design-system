'use client';

import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { SpaceshipLogoV2 } from './SpaceshipLogoV2';
import { SpaceshipPlanet } from './SpaceshipPlanet';
import { SpaceshipStar } from './SpaceshipStar';

// ── Beam SVG paths (mirrors SpaceshipLogoV2) ──────────────────────────────────

const BEAM_PATHS = {
  cone:         'M27 0H41L67.5 76.2913H0L27 0Z',
  coneOutline:  'M39.5771 2L64.6875 74.291H2.83008L28.4141 2H39.5771Z',
  ellipseOutline:
    'M34 66C43.2237 66 51.4883 67.3224 57.376 69.4004C60.3287 70.4425 62.5764 71.6373 64.0469 72.8643C65.5286 74.1007 66 75.17 66 76C66 76.83 65.5286 77.8993 64.0469 79.1357C62.5764 80.3627 60.3287 81.5575 57.376 82.5996C51.4883 84.6776 43.2237 86 34 86C24.7763 86 16.5117 84.6776 10.624 82.5996C7.67125 81.5575 5.42361 80.3627 3.95312 79.1357C2.47139 77.8993 2 76.83 2 76C2 75.17 2.47139 74.1007 3.95312 72.8643C5.42361 71.6373 7.67125 70.4425 10.624 69.4004C16.5117 67.3224 24.7763 66 34 66Z',
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SceneDecoration {
  /** Any React node — typically <SpaceshipPlanet /> or <SpaceshipStar /> */
  element: React.ReactNode;
  /** Absolute position offsets relative to the logo container (scaled with width) */
  position: { top?: number; right?: number; bottom?: number; left?: number };
  /** If true, renders behind the logo (z-index 5 vs 15). Default: true */
  behind?: boolean;
  /** Degrees to spin when cursor is near. Default: 180 (stars). Use 90 for planets. */
  fleeRotation?: number;
}

export interface SpaceshipLogoSceneProps {
  width?: number;
  interactive?: boolean;
  fleeRadius?: number;
  maxDisplacement?: number;
  /** Duration of one full beam sweep cycle in seconds. Default: 3. */
  beamDuration?: number;
  /** Max skewX angle (degrees) for beam sweep. Default: 15. */
  beamSkewRange?: number;
  disableMotion?: boolean;
  decorations?: SceneDecoration[];
  domeColor?: string;
  discColor?: string;
  bellyColor?: string;
  beamColor?: string;
  outlineOpacity?: number;
  className?: string;
}

// ── Default decorations (authored at width=180) ───────────────────────────────

const DEFAULT_DECORATIONS: SceneDecoration[] = [
  // Two stars — above the saucer, behind (default fleeRotation: 180)
  { element: <SpaceshipStar size={20} />,                   position: { top: -16, left: 58 },  behind: true },
  { element: <SpaceshipStar size={14} />,                   position: { top: 0,   left: 78 },  behind: true },
  // Lilac planet — bottom-left, large, behind saucer
  { element: <SpaceshipPlanet color="#C3A8FF" size={32} />, position: { top: 72, left: -40 },  behind: true, fleeRotation: 90 },
  // Mint planet — far right, further out to the side
  { element: <SpaceshipPlanet color="#26E6B5" size={20} />, position: { top: 6,  right: -48 }, behind: true, fleeRotation: 90 },
];

// ── SpaceshipLogoScene ────────────────────────────────────────────────────────

export function SpaceshipLogoScene({
  width = 180,
  interactive = true,
  fleeRadius: fleeRadiusProp,
  maxDisplacement = 100,
  beamDuration = 3,
  beamSkewRange = 15,
  disableMotion = false,
  decorations = DEFAULT_DECORATIONS,
  domeColor = '#F9C600',
  discColor = '#3C7DFF',
  bellyColor = '#F9614D',
  beamColor = '#26E6B5',
  outlineOpacity = 0.1,
  className,
}: SpaceshipLogoSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBeamVisible, setIsBeamVisible] = useState(true);
  const isBeamActiveRef = useRef(true);

  // Motion values for flee physics
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 80, damping: 18 });
  const y = useSpring(rawY, { stiffness: 80, damping: 18 });
  const rotate = useTransform(x, [-maxDisplacement, maxDisplacement], [-30, 30]);
  const fleeRadius = fleeRadiusProp ?? width * 0.5;

  // Derived dimensions — mirrors SpaceshipLogoV2's sizing math
  const scale = width / 129;
  const saucerH = Math.round(94 * scale);
  const beamW = Math.round(68 * scale);
  const beamH = Math.round(88 * scale);
  const overlapPx = Math.round(38 * scale);
  const totalH = saucerH + beamH - overlapPx;
  const beamLeft = Math.round((width - beamW) / 2);
  const beamTop = saucerH - overlapPx;

  // Position scale — all decoration offsets authored at width=180
  const ps = width / 180;

  // Below Navbar size (<32px) get full outline opacity for legibility at small sizes
  const effectiveOutlineOpacity = width < 32 ? 1 : outlineOpacity;

  // Mouse-flee + beam visibility logic
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
        if (isBeamActiveRef.current) {
          isBeamActiveRef.current = false;
          setIsBeamVisible(false);
        }
      } else {
        rawX.set(0);
        rawY.set(0);
        if (!isBeamActiveRef.current) {
          isBeamActiveRef.current = true;
          setIsBeamVisible(true);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, disableMotion, fleeRadius, maxDisplacement, rawX, rawY]);

  const behindDecorations = decorations.filter(d => d.behind !== false);
  const frontDecorations = decorations.filter(d => d.behind === false);

  const beamSvg = (
    <svg width={beamW} height={beamH} viewBox="0 0 68 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={BEAM_PATHS.cone} fill={beamColor} fillOpacity="0.5" />
      <path d={BEAM_PATHS.coneOutline} stroke="black" strokeOpacity={effectiveOutlineOpacity} strokeWidth="4" fill="none" />
      <ellipse cx="34" cy="76" rx="34" ry="12" fill={beamColor} />
      <path d={BEAM_PATHS.ellipseOutline} stroke="black" strokeOpacity={effectiveOutlineOpacity} strokeWidth="4" fill="none" />
    </svg>
  );

  // Compute a scatter vector pointing away from the logo center for a decoration
  const logoCenterX = width / 2;
  const logoCenterY = totalH / 2;

  function getScatterOffset(pos: SceneDecoration['position']) {
    const decX = pos.left !== undefined ? pos.left * ps : width - (pos.right ?? 0) * ps;
    const decY = pos.top  !== undefined ? pos.top  * ps : totalH - (pos.bottom ?? 0) * ps;
    const dx = decX - logoCenterX;
    const dy = decY - logoCenterY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const scatterDist = 30 * ps; // 30px at reference scale
    return { x: (dx / len) * scatterDist, y: (dy / len) * scatterDist };
  }

  function renderDecoration(d: SceneDecoration, i: number, zIndex: number, animated: boolean) {
    const pos = d.position;
    const originY = pos.bottom !== undefined ? 'bottom' : 'top';
    const originX = pos.right  !== undefined ? 'right'  : 'left';
    const posStyle = {
      position: 'absolute' as const,
      zIndex,
      top:    pos.top    !== undefined ? pos.top    * ps : undefined,
      right:  pos.right  !== undefined ? pos.right  * ps : undefined,
      bottom: pos.bottom !== undefined ? pos.bottom * ps : undefined,
      left:   pos.left   !== undefined ? pos.left   * ps : undefined,
    };

    const scaledElement = (
      <div style={{ transform: `scale(${ps})`, transformOrigin: `${originY} ${originX}` }}>
        {d.element}
      </div>
    );

    if (!animated) {
      return <div key={i} style={posStyle}>{scaledElement}</div>;
    }

    const scatter = getScatterOffset(pos);
    const isScattered = !isBeamVisible;

    return (
      <motion.div
        key={i}
        style={posStyle}
        animate={{
          x: isScattered ? scatter.x : 0,
          y: isScattered ? scatter.y : 0,
          rotate: isScattered ? (d.fleeRotation ?? 180) : 0,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      >
        {scaledElement}
      </motion.div>
    );
  }

  if (disableMotion) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width, height: totalH, position: 'relative', overflow: 'visible' }}
      >
        <div style={{ position: 'absolute', top: beamTop, left: beamLeft, zIndex: 0 }}>
          {beamSvg}
        </div>
        {behindDecorations.map((d, i) => renderDecoration(d, i, 5, false))}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <SpaceshipLogoV2 width={width} interactive={false} showBeam={false} disableMotion domeColor={domeColor} discColor={discColor} bellyColor={bellyColor} outlineOpacity={outlineOpacity} />
        </div>
        {frontDecorations.map((d, i) => renderDecoration(d, i, 15, false))}
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{ x, y, width, height: totalH, position: 'relative', overflow: 'visible' }}
    >
      {behindDecorations.map((d, i) => renderDecoration(d, i, 5, true))}
      <motion.div style={{ rotate, position: 'absolute', inset: 0, zIndex: 6 }}>
        {/* Beam — sweeps left-to-right, fades out when cursor is near */}
        <motion.div
          style={{ position: 'absolute', top: beamTop, left: beamLeft, zIndex: 0 }}
          animate={{ opacity: isBeamVisible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            style={{ transformOrigin: 'top center' }}
            animate={{ skewX: [-beamSkewRange, beamSkewRange] }}
            transition={{ repeat: Infinity, repeatType: 'mirror', duration: beamDuration / 2, ease: 'easeInOut' }}
          >
            {beamSvg}
          </motion.div>
        </motion.div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <SpaceshipLogoV2 width={width} interactive={false} showBeam={false} domeColor={domeColor} discColor={discColor} bellyColor={bellyColor} outlineOpacity={outlineOpacity} />
        </div>
      </motion.div>
      {frontDecorations.map((d, i) => renderDecoration(d, i, 15, true))}
    </motion.div>
  );
}
