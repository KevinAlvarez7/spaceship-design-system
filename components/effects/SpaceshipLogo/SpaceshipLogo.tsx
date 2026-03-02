'use client';

import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';

// ── SVG path data ─────────────────────────────────────────────────────────────

const PATHS = {
  redBelly:
    'M55 21C63.6104 21 71.3081 22.64 76.7783 25.2041C82.408 27.843 85 31.0917 85 34C85 36.9083 82.408 40.157 76.7783 42.7959C71.3081 45.36 63.6104 47 55 47C46.3896 47 38.6919 45.36 33.2217 42.7959C27.592 40.157 25 36.9083 25 34C25 31.0917 27.592 27.843 33.2217 25.2041C38.6919 22.64 46.3896 21 55 21Z',
  blueDisc:
    'M55 12C70.0625 12 83.6269 13.6676 93.3643 16.3232C98.247 17.6549 102.054 19.2045 104.594 20.8418C107.223 22.5369 108 23.9881 108 25C108 26.0119 107.223 27.4631 104.594 29.1582C102.054 30.7955 98.247 32.3451 93.3643 33.6768C83.6269 36.3324 70.0625 38 55 38C39.9375 38 26.3731 36.3324 16.6357 33.6768C11.753 32.3451 7.9456 30.7955 5.40625 29.1582C2.77737 27.4631 2 26.0119 2 25C2 23.9881 2.77737 22.5369 5.40625 20.8418C7.9456 19.2045 11.753 17.6549 16.6357 16.3232C26.3731 13.6676 39.9375 12 55 12Z',
  yellowDome:
    'M55 2.5C57.8234 2.5 60.6191 3.05627 63.2275 4.13672C65.836 5.21719 68.2067 6.80042 70.2031 8.79688C72.1996 10.7933 73.7828 13.164 74.8633 15.7725C75.7685 17.9578 76.3036 20.2746 76.4541 22.6289C75.8604 22.9171 74.9449 23.2967 73.6104 23.6875C70.3346 24.6468 64.582 25.6729 55 25.6729C45.418 25.6729 39.6654 24.6468 36.3896 23.6875C35.0545 23.2965 34.1386 22.9172 33.5449 22.6289C33.6954 20.2746 34.2315 17.9578 35.1367 15.7725C36.2172 13.164 37.8004 10.7933 39.7969 8.79688C41.7933 6.80042 44.164 5.21719 46.7725 4.13672C49.3809 3.05627 52.1766 2.5 55 2.5Z',
  beamCone:
    'M41.7031 2L64.917 54H3.13379L27.2764 2H41.7031Z',
  beamEllipse:
    'M34 46C43.2237 46 51.4883 47.3224 57.376 49.4004C60.3287 50.4425 62.5764 51.6373 64.0469 52.8643C65.5286 54.1007 66 55.17 66 56C66 56.83 65.5286 57.8993 64.0469 59.1357C62.5764 60.3627 60.3287 61.5575 57.376 62.5996C51.4883 64.6776 43.2237 66 34 66C24.7763 66 16.5117 64.6776 10.624 62.5996C7.67125 61.5575 5.42361 60.3627 3.95312 59.1357C2.47139 57.8993 2 56.83 2 56C2 55.17 2.47139 54.1007 3.95312 52.8643C5.42361 51.6373 7.67125 50.4425 10.624 49.4004C16.5117 47.3224 24.7763 46 34 46Z',
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SpaceshipLogoProps {
  width?: number;
  interactive?: boolean;
  fleeRadius?: number;
  maxDisplacement?: number;
  beamDuration?: number;
  beamSkewRange?: number;
  disableMotion?: boolean;
  className?: string;
}

// ── SpaceshipLogo ─────────────────────────────────────────────────────────────

export function SpaceshipLogo({
  width = 180,
  interactive = true,
  fleeRadius = 300,
  maxDisplacement = 100,
  beamDuration = 3,
  beamSkewRange = 15,
  disableMotion = false,
  className,
}: SpaceshipLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBeamVisible, setIsBeamVisible] = useState(true);
  const isBeamActiveRef = useRef(true);

  // Motion values for flee physics
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 80, damping: 18 });
  const y = useSpring(rawY, { stiffness: 80, damping: 18 });
  const rotate = useTransform(x, [-maxDisplacement, maxDisplacement], [-15, 15]);

  // Derived dimensions (saucer natural width = 110, beam natural width = 68)
  const scale = width / 110;
  const saucerH = Math.round(49 * scale);
  const beamW = Math.round(68 * scale);
  const beamH = Math.round(68 * scale);
  const overlapPx = Math.round(14 * scale);
  const totalH = saucerH + beamH - overlapPx;
  const beamLeft = Math.round((width - beamW) / 2);
  const beamTop = saucerH - overlapPx;

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

  const beamSvg = (
    <svg width={beamW} height={beamH} viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={PATHS.beamCone} fill="#26E6B5" fillOpacity="0.5" stroke="black" strokeWidth="4" />
      <path d={PATHS.beamEllipse} fill="#26E6B5" stroke="black" strokeWidth="4" />
    </svg>
  );

  const saucerSvg = (
    <svg width={width} height={saucerH} viewBox="0 0 110 49" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={PATHS.redBelly} fill="#F9614D" stroke="black" strokeWidth="4" />
      <path d={PATHS.blueDisc} fill="#3C7DFF" stroke="black" strokeWidth="4" />
      <path d={PATHS.yellowDome} fill="#F9C600" stroke="black" strokeWidth="5" />
    </svg>
  );

  if (disableMotion) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width, height: totalH, position: 'relative' }}
      >
        <div style={{ position: 'absolute', top: beamTop, left: beamLeft, zIndex: 0 }}>
          {beamSvg}
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
          {saucerSvg}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{ x, y, rotate, width, height: totalH, position: 'relative' }}
    >
      {/* Beam layer */}
      <motion.div
        style={{
          position: 'absolute',
          top: beamTop,
          left: beamLeft,
          zIndex: 0,
          transformOrigin: 'top center',
        }}
        animate={
          isBeamVisible
            ? { skewX: [-beamSkewRange, beamSkewRange, -beamSkewRange], opacity: 1 }
            : { skewX: 0, opacity: 0 }
        }
        transition={
          isBeamVisible
            ? { repeat: Infinity, duration: beamDuration, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
      >
        {beamSvg}
      </motion.div>

      {/* Saucer layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
        {saucerSvg}
      </div>
    </motion.div>
  );
}
