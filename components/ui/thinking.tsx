'use client';

import { useState, useEffect, useRef, useId, type ReactNode } from 'react';
import { motion, useAnimationFrame } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';
import { ShimmerText } from './shimmer-text';
import { SpaceshipLogoScene } from '@/components/effects/SpaceshipLogo/SpaceshipLogoScene';

// ━━━ ThinkingDots — animated 3×3 gravity grid icon ━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Grid constants ───────────────────────────────────────────────────────────

const DOT_R_MIN   = 1.6; // resting dot radius
const DOT_R_MAX   = 1.9; // max dot radius at peak influence
const LINE_STROKE = 1.8; // thicker lines

// 3×3 grid: dots at positions 3, 10, 17 on both axes (15% inset, 7px pitch)
const DOTS = Array.from({ length: 9 }, (_, i) => ({
  row: Math.floor(i / 3),
  col: i % 3,
  cx: 3 + (i % 3) * 7,
  cy: 3 + Math.floor(i / 3) * 7,
}));

type GridLine = {
  x1: number; y1: number;   // start (corner or edge dot)
  mx: number; my: number;   // through-point (middle dot)
  x2: number; y2: number;   // end (opposite corner or edge dot)
};

// 6 full-span lines: 3 horizontal + 3 vertical, each passing through all 3 grid points
const LINES: GridLine[] = [
  // Horizontal
  { x1: 3,  y1: 3,  mx: 10, my: 3,  x2: 17, y2: 3  },
  { x1: 3,  y1: 10, mx: 10, my: 10, x2: 17, y2: 10 },
  { x1: 3,  y1: 17, mx: 10, my: 17, x2: 17, y2: 17 },
  // Vertical
  { x1: 3,  y1: 3,  mx: 3,  my: 10, x2: 3,  y2: 17 },
  { x1: 10, y1: 3,  mx: 10, my: 10, x2: 10, y2: 17 },
  { x1: 17, y1: 3,  mx: 17, my: 10, x2: 17, y2: 17 },
];

// Deterministic dot traversal order for the random pattern (stable SSR)
const RANDOM_ORDER = [4, 7, 1, 8, 2, 5, 0, 3, 6];

// ─── Physics constants ────────────────────────────────────────────────────────

const GRID_SHIFT_STRENGTH = 1.8;  // dot & line-endpoint shift (cloth translation)
const CURVE_STRENGTH      = 3.6;  // line midpoint displacement (shift + curvature)
const FALLOFF_SIGMA       = 12;   // Gaussian spread — wider influence radius
const SOFT_RADIUS         = 1;    // smooths displacement through zero when gravity overlaps a grid point
const GRAD_HALF_SPAN      = 30;   // half the repeating gradient tile (60 units → ~12 units per color band)

// ─── Corner paths ─────────────────────────────────────────────────────────────

const CORNERS_RECT = [
  { x: 3,  y: 3  }, // TL
  { x: 17, y: 3  }, // TR
  { x: 17, y: 17 }, // BR
  { x: 3,  y: 17 }, // BL
];

const CORNERS_X = [
  { x: 3,  y: 3  }, // TL
  { x: 17, y: 17 }, // BR
  { x: 17, y: 3  }, // TR
  { x: 3,  y: 17 }, // BL
];

function cornerLap(corners: { x: number; y: number }[], t: number) {
  // Two laps per cycle (one push, one pull)
  const lapT    = (t * 2) % 1;
  const segment = lapT * 4;
  const seg     = Math.floor(segment) % 4;
  const frac    = segment - Math.floor(segment);
  const ease    = (1 - Math.cos(frac * Math.PI)) / 2;
  const from    = corners[seg];
  const to      = corners[(seg + 1) % 4];
  return { x: from.x + (to.x - from.x) * ease, y: from.y + (to.y - from.y) * ease };
}

// ─── Physics helpers ──────────────────────────────────────────────────────────

/** Returns the (x, y) gravity attractor position for the given pattern and normalized time t ∈ [0, 1). */
function gravityPosition(
  pattern: 'diagonal' | 'radial' | 'radial-pull' | 'horizontal' | 'random' | 'breathe' | 'breathe-x',
  t: number,
): { x: number; y: number } {
  const θ = t * 2 * Math.PI;
  switch (pattern) {
    case 'horizontal':
      return { x: 10 + 7 * Math.sin(θ), y: 10 };
    case 'diagonal': {
      const phase = t * 8;
      const seg   = Math.floor(phase) % 8;
      if (seg % 2 === 1) return { x: 10, y: 10 };   // odd = rest at center
      return CORNERS_X[seg / 2];                       // even = wave at corner
    }
    case 'radial':
      return { x: 10 + 7 * Math.cos(θ), y: 10 + 7 * Math.sin(θ) };
    case 'radial-pull': {
      const phase = t * 3;
      const seg   = Math.floor(phase) % 3;
      if (seg === 1) return { x: 10, y: 10 };          // rest at center
      const frac  = phase - Math.floor(phase);
      const angle = frac * 2 * Math.PI;                 // full circle per active segment
      return { x: 10 + 7 * Math.cos(angle), y: 10 + 7 * Math.sin(angle) };
    }
    case 'breathe':
      return cornerLap(CORNERS_RECT, t);
    case 'breathe-x':
      return cornerLap(CORNERS_X, t);
    case 'random': {
      const n      = RANDOM_ORDER.length;
      const step   = Math.floor(t * n) % n;
      const alpha  = (t * n) % 1;
      const smooth = (1 - Math.cos(alpha * Math.PI)) / 2;
      const d0 = DOTS[RANDOM_ORDER[step]];
      const d1 = DOTS[RANDOM_ORDER[(step + 1) % n]];
      return {
        x: d0.cx + (d1.cx - d0.cx) * smooth,
        y: d0.cy + (d1.cy - d0.cy) * smooth,
      };
    }
  }
}

/** Displaces grid point (px, py) toward gravity (gx, gy) with Gaussian falloff; returns dx/dy offsets and 0–1 influence. */
function displacePoint(
  px: number, py: number,
  gx: number, gy: number,
  strength: number,
): { dx: number; dy: number; influence: number } {
  const dvx       = gx - px;
  const dvy       = gy - py;
  const dist      = Math.sqrt(dvx * dvx + dvy * dvy);
  const taper     = Math.exp(-(dist * dist) / (2 * FALLOFF_SIGMA * FALLOFF_SIGMA));
  const magnitude = strength * taper;
  const softDist  = dist + SOFT_RADIUS;
  return {
    dx: -(dvx / softDist * magnitude),
    dy: -(dvy / softDist * magnitude),
    influence: taper,
  };
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const thinkingDotsVariants = cva(
  ['inline-flex items-center justify-center'],
  {
    variants: {
      size: {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-6',
      },
      surface: {
        default:         '',
        'shadow-border': 'rounded-sm shadow-(--shadow-border)',
      },
    },
    defaultVariants: { size: 'md', surface: 'default' },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingDotsProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof thinkingDotsVariants> {
  pattern?:       'diagonal' | 'radial' | 'radial-pull' | 'horizontal' | 'random' | 'breathe' | 'breathe-x';
  duration?:      number;
  disableMotion?: boolean;
  variant?:       'rainbow' | 'subtle';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ThinkingDots({
  pattern       = 'diagonal',
  duration      = 3.6,
  disableMotion = false,
  variant       = 'rainbow',
  size,
  surface,
  className,
  ...props
}: ThinkingDotsProps) {
  const wrapperClass = cn(
    thinkingDotsVariants({ size, surface }),
    variant === 'subtle' && 'thinking-dots-subtle',
    className,
  );

  // Unique gradient ID per instance (avoids collisions with multiple mounts)
  const rawId  = useId();
  const gradId = `td-grad-${rawId.replace(/:/g, '')}`;

  const pathRefs        = useRef<(SVGPathElement         | null)[]>([]);
  const lineOverlayRefs = useRef<(SVGPathElement         | null)[]>([]);
  const dotBaseRefs     = useRef<(SVGCircleElement       | null)[]>([]);
  const dotOverlayRefs  = useRef<(SVGCircleElement       | null)[]>([]);
  const gradRef         = useRef<SVGLinearGradientElement | null>(null);

  useAnimationFrame((time) => {
    if (disableMotion) return;
    const t              = (time / 1000 / duration) % 1;
    const { x: gx, y: gy } = gravityPosition(pattern, t);

    // breathe patterns alternate push/pull: first lap (+1), second lap (−1)
    const isBreathe = pattern === 'breathe' || pattern === 'breathe-x';
    let forceMul: number;
    if (pattern === 'diagonal') {
      const phase = (t * 8) % 8;
      const seg   = Math.floor(phase) % 8;
      if (seg % 2 === 1) {
        forceMul = 0;                                           // odd segment = rest
      } else {
        const frac = phase - Math.floor(phase);
        forceMul = Math.sin(frac * Math.PI);                    // 0 → +1 → 0
      }
    } else if (pattern === 'radial-pull') {
      const phase = (t * 3) % 3;
      const seg   = Math.floor(phase) % 3;
      if (seg === 1) {
        forceMul = 0;                                           // rest
      } else {
        const frac = phase - Math.floor(phase);
        const sign = seg === 0 ? 1 : -1;                       // push then pull
        forceMul = sign * Math.sin(frac * Math.PI);             // 0 → ±1 → 0
      }
    } else if (isBreathe) {
      forceMul = t < 0.5 ? 1 : -1;
    } else {
      forceMul = 1;
    }
    const shiftStr  = GRID_SHIFT_STRENGTH * forceMul;
    const curveStr  = CURVE_STRENGTH      * forceMul;

    // ── Gradient sweep ──────────────────────────────────────────────────────
    // horizontal/diagonal: linear ramp so the band sweeps fully off-screen at
    // both cycle boundaries → seamless loop with no bounce.
    // All other patterns: gravity-derived direction + sin-based sweep (natural
    // loop for radial/breathe/random).
    let sweepDirX: number, sweepDirY: number, sweepOffset: number;

    if (pattern === 'horizontal') {
      sweepDirX   = 1;
      sweepDirY   = 0;
      sweepOffset = (t * 2 - 1) * 20;
    } else {
      // Direction from gravity offset — works for diagonal, radial, breathe, random
      const gdx  = gx - 10;
      const gdy  = gy - 10;
      const gLen = Math.sqrt(gdx * gdx + gdy * gdy) || 1;
      sweepDirX   = gdx / gLen;
      sweepDirY   = gdy / gLen;
      sweepOffset = Math.sin(t * 2 * Math.PI) * 14;
    }

    const ox = 10 + sweepDirX * sweepOffset;
    const oy = 10 + sweepDirY * sweepOffset;
    gradRef.current?.setAttribute('x1', String(ox - sweepDirX * GRAD_HALF_SPAN));
    gradRef.current?.setAttribute('y1', String(oy - sweepDirY * GRAD_HALF_SPAN));
    gradRef.current?.setAttribute('x2', String(ox + sweepDirX * GRAD_HALF_SPAN));
    gradRef.current?.setAttribute('y2', String(oy + sweepDirY * GRAD_HALF_SPAN));

    // Update lines: displace endpoints (cloth shift), midpoint as sole control point (C-curve)
    for (let i = 0; i < LINES.length; i++) {
      const ln = LINES[i];
      const s  = displacePoint(ln.x1, ln.y1, gx, gy, shiftStr);
      const m  = displacePoint(ln.mx, ln.my, gx, gy, curveStr);
      const e  = displacePoint(ln.x2, ln.y2, gx, gy, shiftStr);

      const linePath = `M ${ln.x1 + s.dx} ${ln.y1 + s.dy} Q ${ln.mx + m.dx} ${ln.my + m.dy} ${ln.x2 + e.dx} ${ln.y2 + e.dy}`;
      pathRefs.current[i]?.setAttribute('d', linePath);

      const lineOverlay = lineOverlayRefs.current[i];
      if (lineOverlay) {
        lineOverlay.setAttribute('d', linePath);
        lineOverlay.setAttribute('opacity', String(m.influence * 0.5));
      }
    }

    // Update dots: shift position, pulse radius, influence-based opacity
    for (let i = 0; i < DOTS.length; i++) {
      const { cx, cy }            = DOTS[i];
      const { dx, dy, influence } = displacePoint(cx, cy, gx, gy, shiftStr);
      const shiftedCx             = cx + dx;
      const shiftedCy             = cy + dy;
      const r                     = DOT_R_MIN + influence * (DOT_R_MAX - DOT_R_MIN);

      const base = dotBaseRefs.current[i];
      if (base) {
        base.setAttribute('cx', String(shiftedCx));
        base.setAttribute('cy', String(shiftedCy));
        base.setAttribute('opacity', String(0.65 + influence * 0.35));
        base.setAttribute('r', String(r));
      }

      const overlay = dotOverlayRefs.current[i];
      if (overlay) {
        overlay.setAttribute('cx', String(shiftedCx));
        overlay.setAttribute('cy', String(shiftedCy));
        overlay.setAttribute('opacity', String(influence));
        overlay.setAttribute('r', String(r));
      }
    }
  });

  const svg = (
    <svg aria-hidden="true" {...props} viewBox="0 0 20 20" width="100%" height="100%">
      <defs>
        {/* Narrow-band shimmer — sweeps along gravity direction */}
        <linearGradient
          id={gradId}
          ref={gradRef}
          gradientUnits="userSpaceOnUse"
          spreadMethod="repeat"
          x1="-27" y1="10" x2="33" y2="10"
        >
          <stop offset="0%"   stopColor="var(--effect-thinking-1)" />
          <stop offset="20%"  stopColor="var(--effect-thinking-2)" />
          <stop offset="40%"  stopColor="var(--effect-thinking-3)" />
          <stop offset="60%"  stopColor="var(--effect-thinking-4)" />
          <stop offset="80%"  stopColor="var(--effect-thinking-5)" />
          <stop offset="100%" stopColor="var(--effect-thinking-1)" />
        </linearGradient>
      </defs>
      {LINES.map((ln, i) => (
        <path
          key={i}
          ref={(el) => { pathRefs.current[i] = el; }}
          d={`M ${ln.x1} ${ln.y1} Q ${ln.mx} ${ln.my} ${ln.x2} ${ln.y2}`}
          fill="none"
          stroke="var(--effect-thinking-line)"
          strokeWidth={LINE_STROKE}
          strokeLinecap="round"
        />
      ))}
      {LINES.map((ln, i) => (
        <path
          key={`overlay-${i}`}
          ref={(el) => { lineOverlayRefs.current[i] = el; }}
          d={`M ${ln.x1} ${ln.y1} Q ${ln.mx} ${ln.my} ${ln.x2} ${ln.y2}`}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={LINE_STROKE}
          strokeLinecap="round"
          opacity={0}
        />
      ))}
      {DOTS.map(({ cx, cy }, i) => (
        <g key={i}>
          <circle
            ref={(el) => { dotBaseRefs.current[i] = el; }}
            cx={cx}
            cy={cy}
            r={DOT_R_MIN}
            fill="var(--effect-thinking-dot)"
            opacity={disableMotion ? 0.8 : 0.65}
          />
          <circle
            ref={(el) => { dotOverlayRefs.current[i] = el; }}
            cx={cx}
            cy={cy}
            r={DOT_R_MIN}
            fill={`url(#${gradId})`}
            opacity={0}
          />
        </g>
      ))}
    </svg>
  );

  if (disableMotion) {
    return <span className={wrapperClass}>{svg}</span>;
  }

  return (
    <motion.span
      className={wrapperClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springs.gentle}
    >
      {svg}
    </motion.span>
  );
}

// ━━━ ThinkingShip — mini saucer weaving through asteroid streaks ━━━━━━━━━━━━━

// ─── Constants ────────────────────────────────────────────────────────────────

const SHIP_CX      = 10;               // ship center X in viewBox
const SHIP_CY      = 10;               // ship center Y in viewBox
const WEAVE_AMP    = 0.6;              // primary weave amplitude (px along perpendicular axis)
const WEAVE_AMP_2  = 0.3;              // secondary weave amplitude (px)
const WEAVE_FREQ   = 1.1;              // primary wave frequency (rad/s)
const WEAVE_FREQ_2 = 2.7;              // secondary wave frequency (rad/s)
const SQ2_INV      = 1 / Math.sqrt(2); // ≈ 0.707

// Ship shape — tilt-animatable geometry
const BODY_RX      = 8;    // constant half-width (fills ~80% of viewBox after rotation)
const BODY_RY_MIN  = 1.5;  // side-on profile (neutral)
const BODY_RY_MAX  = 3.5;  // full disc surface visible at max tilt
const DOME_R       = 3;    // dome arc half-span
const DOME_H_MIN   = 1.5;  // dome bump at neutral — must be ≥1.2 to be visible at 16px
const DOME_H_MAX   = 3.5;  // dome height when facing toward viewer
const BELLY_R      = 3;    // belly arc half-span
const BELLY_H_MIN  = 1.2;  // belly bump at neutral
const BELLY_H_MAX  = 3.5;  // belly height when facing away from viewer

/** Asteroid streak — each travels diagonally from top-right to bottom-left. */
type AsteroidDef = { x0: number; y0: number; speed: number; phase: number; half: number };

const ASTEROIDS: AsteroidDef[] = [
  { x0: 18, y0:  0, speed: 8,  phase: 0.00, half: 2.5 },
  { x0: 22, y0:  5, speed: 6,  phase: 0.35, half: 3.0 },
  { x0: 15, y0: -2, speed: 10, phase: 0.60, half: 2.0 },
  { x0: 24, y0:  2, speed: 7,  phase: 0.20, half: 2.8 },
  { x0: 20, y0:  9, speed: 5,  phase: 0.78, half: 2.3 },
];

/** Diagonal travel distance per wrap cycle (viewBox units). */
const ASTEROID_CYCLE = 36;

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const thinkingShipVariants = cva(
  ['inline-flex items-center justify-center'],
  {
    variants: {
      size: {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-6',
      },
      surface: {
        default:         '',
        'shadow-border': 'rounded-sm shadow-(--shadow-border)',
      },
    },
    defaultVariants: { size: 'md', surface: 'default' },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingShipProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof thinkingShipVariants> {
  duration?:      number;
  disableMotion?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ThinkingShip({
  duration      = 4,
  disableMotion = false,
  size,
  surface,
  className,
  ...props
}: ThinkingShipProps) {
  void duration; // exposed for API consistency; internal speeds are fixed

  const wrapperClass = cn(thinkingShipVariants({ size, surface }), className);

  const shipRef      = useRef<SVGGElement | null>(null);
  const bodyRef      = useRef<SVGEllipseElement | null>(null);
  const domeRef      = useRef<SVGPathElement | null>(null);
  const bellyRef     = useRef<SVGPathElement | null>(null);
  const asteroidRefs = useRef<(SVGLineElement | null)[]>([]);

  useAnimationFrame((time) => {
    if (disableMotion) return;
    const t = time / 1000; // seconds

    // ── Ship weave: two-sine oscillation perpendicular to heading ────────────
    // Heading: top-right (1,−1)/√2. Perpendicular (CCW): (1,1)/√2.
    const wave = WEAVE_AMP * Math.sin(t * WEAVE_FREQ) + WEAVE_AMP_2 * Math.sin(t * WEAVE_FREQ_2);
    const sx   = SHIP_CX + wave * SQ2_INV;
    const sy   = SHIP_CY + wave * SQ2_INV;
    shipRef.current?.setAttribute('transform', `translate(${sx.toFixed(2)}, ${sy.toFixed(2)}) rotate(-45)`);

    // ── Perspective tilt: body fattens, dome/belly swell at wave extremes ────
    // Normalize wave to -1…+1; positive = facing viewer, negative = facing away.
    const normalized = wave / (WEAVE_AMP + WEAVE_AMP_2);
    const absTilt    = Math.abs(normalized);

    // Body ry grows symmetrically at both tilt extremes
    const bodyRY = BODY_RY_MIN + absTilt * (BODY_RY_MAX - BODY_RY_MIN);
    bodyRef.current?.setAttribute('ry', bodyRY.toFixed(3));

    // Dome swells when facing viewer (wave > 0)
    const domeH = DOME_H_MIN + Math.max(0, normalized) * (DOME_H_MAX - DOME_H_MIN);
    domeRef.current?.setAttribute('d',
      `M ${-DOME_R} ${-bodyRY.toFixed(3)} A ${DOME_R} ${domeH.toFixed(3)} 0 0 0 ${DOME_R} ${-bodyRY.toFixed(3)} Z`
    );

    // Belly swells when facing away (wave < 0)
    const bellyH = BELLY_H_MIN + Math.max(0, -normalized) * (BELLY_H_MAX - BELLY_H_MIN);
    bellyRef.current?.setAttribute('d',
      `M ${-BELLY_R} ${bodyRY.toFixed(3)} A ${BELLY_R} ${bellyH.toFixed(3)} 0 0 1 ${BELLY_R} ${bodyRY.toFixed(3)} Z`
    );

    // ── Asteroid streaks: diagonal travel, wrap when off-screen ─────────────
    for (let i = 0; i < ASTEROIDS.length; i++) {
      const a        = ASTEROIDS[i];
      const progress = (t * a.speed + a.phase * ASTEROID_CYCLE) % ASTEROID_CYCLE;
      const cx       = a.x0 - progress * SQ2_INV;
      const cy       = a.y0 + progress * SQ2_INV;
      // Fade in over 2 units, fade out over 4 units near the end of each cycle
      const opacity  = Math.min(1, Math.min(progress / 2, (ASTEROID_CYCLE - progress) / 4));
      const el       = asteroidRefs.current[i];
      if (el) {
        el.setAttribute('x1', (cx + a.half * SQ2_INV).toFixed(2));
        el.setAttribute('y1', (cy - a.half * SQ2_INV).toFixed(2));
        el.setAttribute('x2', (cx - a.half * SQ2_INV).toFixed(2));
        el.setAttribute('y2', (cy + a.half * SQ2_INV).toFixed(2));
        el.setAttribute('opacity', opacity.toFixed(3));
      }
    }
  });

  const svg = (
    <svg aria-hidden="true" {...props} viewBox="0 0 20 20" width="100%" height="100%">
      {/* Asteroid streaks — rendered first so they appear behind the ship */}
      {ASTEROIDS.map((_, i) => (
        <line
          key={i}
          ref={(el) => { asteroidRefs.current[i] = el; }}
          x1="20" y1="0" x2="20" y2="0"
          stroke="var(--effect-thinking-asteroid)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={0}
        />
      ))}
      {/* Simplified saucer, pointing top-right (rotate −45° in ship-local space) */}
      <g
        ref={shipRef}
        transform={`translate(${SHIP_CX}, ${SHIP_CY}) rotate(-45)`}
      >
        {/* Belly — semicircle below body, grows when facing away from viewer */}
        <path
          ref={bellyRef}
          d={`M ${-BELLY_R} ${BODY_RY_MIN} A ${BELLY_R} ${BELLY_H_MIN} 0 0 1 ${BELLY_R} ${BODY_RY_MIN} Z`}
          fill="var(--effect-thinking-ship-belly)"
        />
        {/* Body — ellipse with dynamic ry, fattens at tilt extremes */}
        <ellipse
          ref={bodyRef}
          cx="0" cy="0"
          rx={BODY_RX} ry={BODY_RY_MIN}
          fill="var(--effect-thinking-ship-body)"
        />
        {/* Dome — semicircle above body, grows when facing toward viewer */}
        <path
          ref={domeRef}
          d={`M ${-DOME_R} ${-BODY_RY_MIN} A ${DOME_R} ${DOME_H_MIN} 0 0 0 ${DOME_R} ${-BODY_RY_MIN} Z`}
          fill="var(--effect-thinking-ship-dome)"
        />
      </g>
    </svg>
  );

  if (disableMotion) {
    return <span className={wrapperClass}>{svg}</span>;
  }

  return (
    <motion.span
      className={wrapperClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springs.gentle}
    >
      {svg}
    </motion.span>
  );
}

// ━━━ ThinkingLogo — SpaceshipLogoScene at 20×24 px ━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingLogoProps {
  disableMotion?: boolean;
  className?:     string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/** SpaceshipLogoScene (saucer + beam sweep) rendered at 20×24 px as a thinking indicator. */
export function ThinkingLogo({ disableMotion = false, className }: ThinkingLogoProps) {
  return (
    <span className={cn('inline-flex items-center justify-center w-5 h-6 overflow-hidden', className)}>
      <SpaceshipLogoScene
        width={20}
        interactive={false}
        disableMotion={disableMotion}
        decorations={[]}
      />
    </span>
  );
}

// ━━━ ThinkingSaucer — beam-less saucer icon (32×32 inline SVG) ━━━━━━━━━━━━━━

// ─── Path data ────────────────────────────────────────────────────────────────

type SaucerPaths = {
  bellyFill: string; bellyOutline: string;
  discFill:  string; discOutline:  string;
  domeFill:  string; domeOutline:  string;
};

type SaucerFilterCfg = {
  x: string; y: string; width: string; height: string;
  dy1: string; stdDev1: string;
  dy2: string; stdDev2: string;
};

const SAUCER_PATHS: Record<'tilted' | 'upright', SaucerPaths> = {
  tilted: {
    bellyFill:    'M25.8488 17.0545C26.3602 19.4603 22.614 22.2951 17.4815 23.386C12.349 24.477 7.77373 23.411 7.26235 21.0051C6.75097 18.5993 10.4971 15.7646 15.6296 14.6736C20.7621 13.5827 25.3374 14.6486 25.8488 17.0545Z',
    bellyOutline: 'M24.6871 17.3014C24.5838 16.8151 23.949 16.1164 22.2027 15.7095C20.5581 15.3263 18.3115 15.3177 15.8765 15.8353C13.4416 16.3528 11.3927 17.2745 10.0462 18.2934C8.61631 19.3754 8.32065 20.272 8.424 20.7582C8.52736 21.2445 9.16212 21.9433 10.9085 22.3501C12.553 22.7333 14.7996 22.7419 17.2346 22.2244L17.4815 23.386C12.349 24.477 7.77373 23.411 7.26235 21.0051C6.75097 18.5993 10.4971 15.7646 15.6296 14.6736C20.7621 13.5827 25.3374 14.6486 25.8488 17.0545C26.3602 19.4603 22.614 22.2951 17.4815 23.386L17.2346 22.2244C19.6696 21.7068 21.7184 20.7851 23.065 19.7662C24.4948 18.6842 24.7905 17.7877 24.6871 17.3014Z',
    discFill:     'M31.9727 13.021C32.4841 15.4269 25.7474 18.8972 16.9259 20.7723C8.10445 22.6474 0.538672 22.2171 0.0272912 19.8112C-0.48409 17.4053 6.25258 13.935 15.0741 12.0599C23.8955 10.1848 31.4613 10.6151 31.9727 13.021Z',
    discOutline:  'M30.8111 13.2679C30.8103 13.2645 30.8078 13.2529 30.7932 13.2299C30.7774 13.205 30.7444 13.1627 30.6805 13.1068C30.5467 12.9901 30.312 12.8457 29.935 12.7024C29.177 12.4143 28.0439 12.2046 26.5724 12.1209C23.6469 11.9545 19.659 12.2995 15.321 13.2216C10.983 14.1436 7.19952 15.4505 4.59461 16.7924C3.28442 17.4674 2.33453 18.1198 1.75926 18.6913C1.47317 18.9756 1.31741 19.203 1.24271 19.364C1.20699 19.4411 1.19413 19.4931 1.1898 19.5223C1.18581 19.5493 1.18822 19.5609 1.18894 19.5643C1.18966 19.5677 1.19219 19.5793 1.2068 19.6023C1.22263 19.6272 1.25555 19.6695 1.31951 19.7254C1.45326 19.8421 1.68804 19.9865 2.06502 20.1298C2.82301 20.4179 3.95615 20.6276 5.4276 20.7113C8.3531 20.8777 12.341 20.5327 16.679 19.6106L16.9259 20.7723C8.10445 22.6474 0.538672 22.2171 0.0272912 19.8112C-0.48409 17.4053 6.25258 13.935 15.0741 12.0599C23.8955 10.1848 31.4613 10.6151 31.9727 13.021C32.4841 15.4269 25.7474 18.8972 16.9259 20.7723L16.679 19.6106C21.017 18.6886 24.8005 17.3817 27.4054 16.0398C28.7156 15.3648 29.6655 14.7124 30.2407 14.1409C30.5268 13.8566 30.6826 13.6292 30.7573 13.4682C30.793 13.3911 30.8059 13.3391 30.8102 13.3099C30.8142 13.2829 30.8118 13.2713 30.8111 13.2679Z',
    domeFill:     'M22.9082 14.6442C22.7136 13.7289 22.3407 12.8609 21.8107 12.0897C21.2807 11.3185 20.6039 10.6593 19.8192 10.1496C19.0344 9.63999 18.1569 9.28991 17.2368 9.11938C16.3167 8.94886 15.3721 8.96122 14.4568 9.15578C13.5415 9.35033 12.6735 9.72326 11.9023 10.2533C11.1311 10.7833 10.4719 11.46 9.96222 12.2448C9.45258 13.0296 9.1025 13.9071 8.93197 14.8271C8.76144 15.7472 8.77381 16.6919 8.96836 17.6072C8.96836 17.6072 10.5328 18.5413 16.1959 17.3376C21.8589 16.1339 22.9082 14.6442 22.9082 14.6442Z',
    domeOutline:  'M14.6288 9.12129C15.4901 8.96026 16.3743 8.95952 17.2368 9.11938C18.1569 9.28991 19.0344 9.63999 19.8192 10.1496C20.6039 10.6593 21.2807 11.3185 21.8107 12.0897C22.3407 12.8609 22.7136 13.7289 22.9082 14.6442C22.9082 14.6442 21.8589 16.1339 16.1959 17.3376L15.9489 16.1759C18.7024 15.5906 20.267 14.9497 21.1123 14.4941C21.2963 14.395 21.4449 14.3045 21.5641 14.2265C21.389 13.7081 21.1431 13.2152 20.832 12.7625C20.3903 12.1198 19.8264 11.5702 19.1724 11.1455C18.5185 10.7208 17.787 10.4292 17.0203 10.2871C16.2536 10.145 15.4664 10.1553 14.7037 10.3174C13.941 10.4795 13.2177 10.7904 12.575 11.232C11.9324 11.6737 11.3828 12.2375 10.9581 12.8915C10.5334 13.5455 10.2418 14.2769 10.0997 15.0437C9.99962 15.5838 9.97512 16.1342 10.0261 16.679C10.1668 16.7018 10.3394 16.7239 10.548 16.7397C11.5054 16.812 13.1955 16.7612 15.9489 16.1759L16.1959 17.3376L15.677 17.4443C10.4366 18.4839 8.96836 17.6072 8.96836 17.6072C8.78598 16.7491 8.76368 15.8653 8.9021 15L8.93197 14.8271C9.1025 13.9071 9.45258 13.0296 9.96222 12.2448C10.44 11.5091 11.0492 10.8683 11.7589 10.3544L11.9023 10.2533C12.6735 9.72326 13.5415 9.35033 14.4568 9.15578L14.6288 9.12129Z',
  },
  upright: {
    bellyFill:    'M25.3091 18.8909C25.3091 21.3009 21.1413 23.2545 16 23.2545C10.8587 23.2545 6.69091 21.3009 6.69091 18.8909C6.69091 16.4809 10.8587 14.5273 16 14.5273C21.1413 14.5273 25.3091 16.4809 25.3091 18.8909Z',
    bellyOutline: 'M24.1455 18.8909C24.1455 18.4038 23.6794 17.6048 22.0886 16.8591C20.5906 16.1569 18.4391 15.6909 16 15.6909C13.5609 15.6909 11.4095 16.1569 9.91136 16.8591C8.32056 17.6048 7.85455 18.4038 7.85455 18.8909C7.85455 19.378 8.32056 20.177 9.91136 20.9227C11.4095 21.625 13.5609 22.0909 16 22.0909V23.2545C10.8587 23.2545 6.69091 21.3009 6.69091 18.8909C6.69091 16.4809 10.8587 14.5273 16 14.5273C21.1413 14.5273 25.3091 16.4809 25.3091 18.8909C25.3091 21.3009 21.1413 23.2545 16 23.2545V22.0909C18.4391 22.0909 20.5906 21.625 22.0886 20.9227C23.6794 20.177 24.1455 19.378 24.1455 18.8909Z',
    discFill:     'M32 16.2727C32 18.6827 24.8366 20.6364 16 20.6364C7.16344 20.6364 3.5611e-08 18.6827 0 16.2727C-3.56099e-08 13.8628 7.16344 11.9091 16 11.9091C24.8366 11.9091 32 13.8628 32 16.2727Z',
    discOutline:  'M30.8364 16.2727C30.8364 16.2693 30.8363 16.2577 30.827 16.2327C30.8169 16.2056 30.794 16.1583 30.744 16.0918C30.6396 15.9526 30.444 15.7664 30.1119 15.5523C29.4442 15.1217 28.4009 14.6899 27.0077 14.3099C24.2377 13.5545 20.3454 13.0727 16 13.0727C11.6546 13.0727 7.76226 13.5545 4.99233 14.3099C3.59913 14.6899 2.55584 15.1217 1.88807 15.5523C1.55597 15.7664 1.36037 15.9526 1.25597 16.0918C1.20604 16.1583 1.1831 16.2056 1.17301 16.2327C1.16369 16.2577 1.16364 16.2693 1.16364 16.2727C1.16364 16.2761 1.16369 16.2877 1.17301 16.3128C1.1831 16.3399 1.20604 16.3872 1.25597 16.4537C1.36037 16.5928 1.55597 16.779 1.88807 16.9932C2.55584 17.4238 3.59913 17.8555 4.99233 18.2355C7.76226 18.9909 11.6546 19.4727 16 19.4727V20.6364C7.16344 20.6364 3.5611e-08 18.6827 0 16.2727C-3.56099e-08 13.8628 7.16344 11.9091 16 11.9091C24.8366 11.9091 32 13.8628 32 16.2727C32 18.6827 24.8366 20.6364 16 20.6364V19.4727C20.3454 19.4727 24.2377 18.9909 27.0077 18.2355C28.4009 17.8555 29.4442 17.4238 30.1119 16.9932C30.444 16.779 30.6396 16.5928 30.744 16.4537C30.794 16.3872 30.8169 16.3399 30.827 16.3128C30.8363 16.2877 30.8364 16.2761 30.8364 16.2727Z',
    domeFill:     'M22.9818 15.9818C22.9818 15.065 22.8012 14.1571 22.4504 13.31C22.0995 12.4629 21.5852 11.6932 20.9369 11.0449C20.2886 10.3966 19.5189 9.88233 18.6718 9.53146C17.8248 9.18059 16.9169 9 16 9C15.0831 9 14.1752 9.18059 13.3282 9.53146C12.4811 9.88233 11.7114 10.3966 11.0631 11.0449C10.4148 11.6932 9.90051 12.4629 9.54964 13.31C9.19877 14.1571 9.01818 15.065 9.01818 15.9818C9.01818 15.9818 10.3273 17.1958 16 17.1958C21.6727 17.1958 22.9818 15.9818 22.9818 15.9818Z',
    domeOutline:  'M16.1719 9.00199C17.0302 9.02312 17.8777 9.20253 18.6718 9.53146C19.5189 9.88233 20.2886 10.3966 20.9369 11.0449C21.5852 11.6932 22.0995 12.4629 22.4504 13.31C22.8012 14.1571 22.9818 15.065 22.9818 15.9818C22.9818 15.9818 21.6727 17.1958 16 17.1958V16.0321C18.7582 16.0321 20.3883 15.7366 21.2912 15.4722C21.4877 15.4146 21.6486 15.3582 21.7787 15.3077C21.7166 14.7752 21.5813 14.2527 21.3753 13.7554C21.0829 13.0495 20.6545 12.4079 20.1142 11.8676C19.5739 11.3273 18.9323 10.8989 18.2264 10.6065C17.5206 10.3142 16.764 10.1636 16 10.1636C15.236 10.1636 14.4795 10.3142 13.7736 10.6065C13.0677 10.8989 12.4261 11.3273 11.8858 11.8676C11.3455 12.4079 10.9171 13.0495 10.6247 13.7554C10.4187 14.2527 10.2831 14.7752 10.221 15.3077C10.3512 15.3582 10.5122 15.4146 10.7088 15.4722C11.6117 15.7366 13.2418 16.0321 16 16.0321V17.1958L15.481 17.1923C10.2467 17.1211 9.01818 15.9818 9.01818 15.9818C9.01818 15.1223 9.17687 14.2706 9.4858 13.4696L9.54964 13.31C9.90051 12.4629 10.4148 11.6932 11.0631 11.0449C11.6709 10.4371 12.3853 9.94713 13.1702 9.59915L13.3282 9.53146C14.1752 9.18059 15.0831 9 16 9L16.1719 9.00199Z',
  },
} as const;

const SAUCER_FILTERS: Record<'tilted' | 'upright', SaucerFilterCfg> = {
  tilted:  { x: '-1.1876', y: '8.4062',  width: '34.3752', height: '17.1897', dy1: '0.593802', stdDev1: '0.593802', dy2: '0.296901', stdDev2: '0.296901' },
  upright: { x: '-1.16364', y: '8.41818', width: '34.3273', height: '16.5822', dy1: '0.581818', stdDev1: '0.581818', dy2: '0.290909', stdDev2: '0.290909' },
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingSaucerProps {
  variant?:       'tilted' | 'upright';
  disableMotion?: boolean;
  className?:     string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/** Beam-less inline saucer icon at 16×16 px — Figma 32×32 paths scaled to fit. */
export function ThinkingSaucer({
  variant = 'tilted',
  disableMotion = false,
  className,
}: ThinkingSaucerProps) {
  const rawId    = useId();
  const filterId = `ts-f-${rawId.replace(/:/g, '')}`;
  const clipId   = `ts-c-${rawId.replace(/:/g, '')}`;
  const paths    = SAUCER_PATHS[variant];
  const fCfg     = SAUCER_FILTERS[variant];

  const wrapperClass = cn('inline-flex size-4 items-center justify-center', className);

  const svg = (
    <svg aria-hidden="true" viewBox="0 0 32 32" width="100%" height="100%" fill="none">
      <defs>
        <filter
          id={filterId}
          x={fCfg.x} y={fCfg.y} width={fCfg.width} height={fCfg.height}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy={fCfg.dy1} />
          <feGaussianBlur stdDeviation={fCfg.stdDev1} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="e1" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy={fCfg.dy2} />
          <feGaussianBlur stdDeviation={fCfg.stdDev2} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
          <feBlend mode="normal" in2="e1" result="e2" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
          <feBlend mode="normal" in2="e2" result="e3" />
          <feBlend mode="normal" in="SourceGraphic" in2="e3" result="shape" />
        </filter>
        <clipPath id={clipId}>
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g filter={`url(#${filterId})`}>
          <path d={paths.bellyFill}    fill="#F9614D" shapeRendering="crispEdges" />
          <path d={paths.bellyOutline} fill="black"   fillOpacity={0.1} shapeRendering="crispEdges" />
          <path d={paths.discFill}     fill="#3C7DFF" shapeRendering="crispEdges" />
          <path d={paths.discOutline}  fill="black"   fillOpacity={0.1} shapeRendering="crispEdges" />
          <path d={paths.domeFill}     fill="#F9C600" shapeRendering="crispEdges" />
          <path d={paths.domeOutline}  fill="black"   fillOpacity={0.1} shapeRendering="crispEdges" />
        </g>
      </g>
    </svg>
  );

  if (disableMotion) {
    return <span className={wrapperClass}>{svg}</span>;
  }

  return (
    <motion.span
      className={wrapperClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springs.gentle}
    >
      {svg}
    </motion.span>
  );
}

// ━━━ Thinking — shimmer label with scramble and dots ━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Labels ───────────────────────────────────────────────────────────────────

const SCRAMBLE_LABELS = [
  'Thinking',
  'Launching',
  'Orbiting',
  'Navigating',
  'Charting',
  'Drifting',
  'Scanning',
  'Exploring',
] as const;

// ─── Scramble ─────────────────────────────────────────────────────────────────

const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz~+=*^•·-';
const SCRAMBLE_DURATION = 900;

type ScrambleChar = { char: string; resolved: boolean };

function useTextScramble(target: string, active: boolean): ScrambleChar[] {
  const [chars, setChars] = useState<ScrambleChar[]>(() =>
    target.split('').map(char => ({ char, resolved: true }))
  );
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    startRef.current = null;

    function frame(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / SCRAMBLE_DURATION, 1);

      setChars(
        target.split('').map((char, i) => {
          const resolveAt = (i + 1) / target.length;
          if (char === ' ' || progress >= resolveAt) {
            return { char, resolved: true };
          }
          return {
            char: SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
            resolved: false,
          };
        })
      );

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      }
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, active]);

  if (!active) {
    return target.split('').map(char => ({ char, resolved: true }));
  }
  return chars;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

export const thinkingVariants = cva(
  ['inline-flex items-center', '[font-weight:var(--font-weight-semibold)]', 'font-(family-name:--font-family-secondary)'],
  {
    variants: {
      size: {
        'caption-1': ['gap-1.5', '[font-size:var(--font-size-base)]', 'leading-(--line-height-sm)'],
        'caption-2': ['gap-1',   '[font-size:var(--font-size-sm)]',   'leading-(--line-height-xs)'],
      },
      surface: {
        default:         '',
        'shadow-border': 'rounded-full shadow-(--shadow-border) px-2 py-0.5',
      },
    },
    defaultVariants: { size: 'caption-1', surface: 'default' },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof thinkingVariants> {
  disableMotion?: boolean;
  /** Shimmer style applied to text and dots. Defaults to 'blob'. */
  shimmerVariant?: 'blob' | 'linear' | 'subtle';
  /** Show animated dots after the label. Defaults to true. */
  dots?: boolean;
  /** Cycle through themed loading labels with a character-decode scramble every 3 s. Overrides children. Disabled when disableMotion is set. */
  textScramble?: boolean;
  /** Icon shown before the label. Defaults to 'dots'. */
  icon?: 'dots' | 'spaceship' | 'logo' | 'saucer' | 'saucer-upright';
  children?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Thinking({
  size = 'caption-1',
  surface = 'default',
  shimmerVariant = 'blob',
  disableMotion = false,
  dots = true,
  textScramble = false,
  icon = 'dots',
  children = 'Thinking',
  className,
  ...props
}: ThinkingProps) {
  const [labelIndex, setLabelIndex] = useState(0);
  const scrambleActive = textScramble && !disableMotion;
  const scrambleChars = useTextScramble(SCRAMBLE_LABELS[labelIndex], scrambleActive);

  useEffect(() => {
    if (!scrambleActive) return;
    const id = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % SCRAMBLE_LABELS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [scrambleActive]);

  const iconEl = icon === 'logo'
    ? <ThinkingLogo disableMotion={disableMotion} />
    : icon === 'spaceship'
    ? <ThinkingShip size="sm" disableMotion={disableMotion} />
    : icon === 'saucer'
    ? <ThinkingSaucer variant="tilted" disableMotion={disableMotion} />
    : icon === 'saucer-upright'
    ? <ThinkingSaucer variant="upright" disableMotion={disableMotion} />
    : <ThinkingDots size="sm" pattern="radial" variant={shimmerVariant === 'subtle' ? 'subtle' : 'rainbow'} disableMotion={disableMotion} />;

  let content: ReactNode;

  if (scrambleActive) {
    content = (
      <>
        {iconEl}
        <ShimmerText variant={shimmerVariant} disableMotion={disableMotion} dots={dots}>
          {scrambleChars.map((c, i) => (
            <span key={i}>{c.char}</span>
          ))}
        </ShimmerText>
      </>
    );
  } else {
    content = (
      <>
        {iconEl}
        <ShimmerText variant={shimmerVariant} disableMotion={disableMotion} dots={dots}>{children}</ShimmerText>
      </>
    );
  }

  if (disableMotion) {
    return (
      <span className={cn(thinkingVariants({ size, surface }), className)} {...props}>
        {content}
      </span>
    );
  }

  return (
    <motion.span
      className={cn(thinkingVariants({ size, surface }), className)}
      {...(props as object)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springs.gentle}
    >
      {content}
    </motion.span>
  );
}
