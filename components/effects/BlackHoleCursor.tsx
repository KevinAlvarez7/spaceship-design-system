'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationFrame,
  AnimatePresence,
  type MotionValue,
} from 'motion/react';
import { SpaceshipPlanet } from './SpaceshipLogo/SpaceshipPlanet';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BlackHoleCursorProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  isVisible: boolean;
  size?: number;
  orbitRadius?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PLANET_SIZE = 20;
const ENTER_EXIT = { type: 'spring' as const, stiffness: 400, damping: 28 };

// ── BlackHoleCursor ───────────────────────────────────────────────────────────

export function BlackHoleCursor({
  x,
  y,
  isVisible,
  size = 56,
  orbitRadius = 70,
}: BlackHoleCursorProps) {
  const half = size / 2;
  const planetHalf = PLANET_SIZE / 2;

  // ── Ship position centered at cursor ──────────────────────────────────
  const shipX = useTransform(x, (v) => v - half);
  const shipY = useTransform(y, (v) => v - half);

  // ── Heading — cumulative degrees so the spring never wraps ────────────
  const prevXRef = useRef(-200);
  const prevYRef = useRef(-200);
  const rawHeading = useMotionValue(90);
  /**
   * Smoothed heading spring.
   * ζ = damping / (2 × √stiffness) = 26 / (2 × √180) ≈ 0.97 (critically damped).
   */
  const heading = useSpring(rawHeading, { stiffness: 180, damping: 26 });

  // ── Momentum — normalized speed (0–1) for perspective tilt ───────────
  const rawMomentum = useMotionValue(0);
  /**
   * Smoothed momentum spring.
   * ζ = damping / (2 × √stiffness) = 20 / (2 × √150) ≈ 0.82.
   */
  const smoothMomentum = useSpring(rawMomentum, { stiffness: 150, damping: 20 });

  // ── Perspective tilt: squash + shift per shape (A-tier CSS transforms) ──────
  // translateY replaces cy attribute changes; scaleY replaces ry attribute changes.
  // transformBox:fill-box + transformOrigin:center anchors scaleY to the ellipse center.
  // Red belly: base cy=24, base ry=19 (same as blue at rest → fully hidden).
  const redY               = useTransform(smoothMomentum, [0, 1], [0, 3]);        // cy 24→27
  const redScaleYVal       = useTransform(smoothMomentum, [0, 1], [1, 10 / 19]);  // ry 19→10
  const redStrokeScaleYVal = useTransform(smoothMomentum, [0, 1], [1, 8.5 / 17.5]); // ry 17.5→8.5

  const blueY               = useTransform(smoothMomentum, [0, 1], [0, -1]);       // cy 24→23
  const blueScaleYVal       = useTransform(smoothMomentum, [0, 1], [1, 8 / 19]);   // ry 19→8
  const blueStrokeScaleYVal = useTransform(smoothMomentum, [0, 1], [1, 6.5 / 17.5]); // ry 17.5→6.5

  // Yellow dome — asymmetric path: crown arc stays full, base arc flattens on momentum.
  // At rest ryTop=ryBottom=9 → perfect circle. Moving: crown grows, base flattens.
  const yellowCy        = useTransform(smoothMomentum, [0, 1], [21, 19]);
  const yellowRyTop     = useTransform(smoothMomentum, [0, 1], [11, 10]);
  const yellowRyBottom  = useTransform(smoothMomentum, [0, 1], [11, 5]);

  /** Builds a two-arc closed path: first arc (L→R) is toward ship center, second (R→L) is the crown toward direction of travel. */
  const yellowPath = useTransform(
    [yellowCy, yellowRyTop, yellowRyBottom] as MotionValue<number>[],
    ([cy, ryTop, ryBottom]: number[]) =>
      `M ${24 - 11} ${cy} A 11 ${ryBottom} 0 0 0 ${24 + 11} ${cy} A 11 ${ryTop} 0 0 0 ${24 - 11} ${cy} Z`
  );
  const yellowStrokePath = useTransform(
    [yellowCy, yellowRyTop, yellowRyBottom] as MotionValue<number>[],
    ([cy, ryTop, ryBottom]: number[]) =>
      `M ${24 - 9.5} ${cy} A 9.5 ${Math.max(ryBottom - 1.5, 1)} 0 0 0 ${24 + 9.5} ${cy} A 9.5 ${Math.max(ryTop - 1.5, 1)} 0 0 0 ${24 - 9.5} ${cy} Z`
  );

  // ── Orbit angles + planet MotionValue positions ───────────────────────
  const orbit1 = useMotionValue(0);
  const orbit2 = useMotionValue(Math.PI * 0.7); // phase offset so planets don't overlap at start
  const p1x = useMotionValue(-200);
  const p1y = useMotionValue(-200);
  const p2x = useMotionValue(-200);
  const p2y = useMotionValue(-200);

  /** Updates heading and planet positions every animation frame. */
  useAnimationFrame((_, delta) => {
    const cx = x.get();
    const cy = y.get();
    const dt = delta / 1000; // ms → s

    // ── Heading ──────────────────────────────────────────────────────────
    const dx = cx - prevXRef.current;
    const dy = cy - prevYRef.current;
    prevXRef.current = cx;
    prevYRef.current = cy;

    const speed = Math.sqrt(dx * dx + dy * dy);
    rawMomentum.set(Math.min(speed / 8, 1));
    if (speed > 0.5) {
      // +90° offset: SVG front faces up; atan2(0,1)=0° for rightward → +90° aligns front to direction
      const targetDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      const current = rawHeading.get();
      // Shortest-arc delta to prevent spring from animating the long way around ±180°
      let angDelta = targetDeg - (current % 360);
      if (angDelta > 180) angDelta -= 360;
      if (angDelta < -180) angDelta += 360;
      rawHeading.set(current + angDelta);
    }

    // ── Orbit ─────────────────────────────────────────────────────────────
    orbit1.set(orbit1.get() + dt * 1.3); // outer orbit, ~1.3 rad/s
    orbit2.set(orbit2.get() + dt * 2.1); // inner orbit, faster

    const a1 = orbit1.get();
    const a2 = orbit2.get();
    const R = orbitRadius;

    p1x.set(cx + Math.cos(a1) * R - planetHalf);
    p1y.set(cy + Math.sin(a1) * R - planetHalf);
    p2x.set(cx + Math.cos(a2) * (R * 0.65) - planetHalf);
    p2y.set(cy + Math.sin(a2) * (R * 0.65) - planetHalf);
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="bh-planet-1"
          className="pointer-events-none fixed z-50"
          style={{ left: 0, top: 0, x: p1x, y: p1y }}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={ENTER_EXIT}
        >
          <SpaceshipPlanet color="#C3A8FF" size={PLANET_SIZE} />
        </motion.div>
      )}
      {isVisible && (
        <motion.div
          key="bh-planet-2"
          className="pointer-events-none fixed z-50"
          style={{ left: 0, top: 0, x: p2x, y: p2y }}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={ENTER_EXIT}
        >
          <SpaceshipPlanet color="#26E6B5" size={PLANET_SIZE} />
        </motion.div>
      )}
      {isVisible && (
        <motion.div
          key="bh-ship"
          className="pointer-events-none fixed z-50"
          style={{ left: 0, top: 0, x: shipX, y: shipY, rotate: heading, willChange: 'transform' }}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={ENTER_EXIT}
        >
          {/* Top-down spaceship: viewBox 0 0 48 48 */}
          <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Red back crescent — cx/cy fixed; y+scaleY CSS transforms are A-tier */}
            <motion.ellipse cx={24} cy={24} rx={14} ry={19} fill="#F9614D"
              style={{ y: redY, scaleY: redScaleYVal, transformBox: 'fill-box', transformOrigin: 'center' }} />
            <motion.ellipse cx={24} cy={24} rx={12.5} ry={17.5} stroke="black" strokeOpacity="0.1" strokeWidth="3" fill="none"
              style={{ y: redY, scaleY: redStrokeScaleYVal, transformBox: 'fill-box', transformOrigin: 'center' }} />
            {/* Blue disc — main saucer body */}
            <motion.ellipse cx={24} cy={24} rx={19} ry={19} fill="#3C7DFF"
              style={{ y: blueY, scaleY: blueScaleYVal, transformBox: 'fill-box', transformOrigin: 'center' }} />
            <motion.ellipse cx={24} cy={24} rx={17.5} ry={17.5} stroke="black" strokeOpacity="0.1" strokeWidth="3" fill="none"
              style={{ y: blueY, scaleY: blueStrokeScaleYVal, transformBox: 'fill-box', transformOrigin: 'center' }} />
            {/* Yellow dome — asymmetric path: crown arc full, base arc flattens on momentum */}
            <motion.path d={yellowPath} fill="#F9C600" />
            <motion.path d={yellowStrokePath} stroke="black" strokeOpacity="0.1" strokeWidth="3" fill="none" />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
