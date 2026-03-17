'use client';

import { useRef, useId } from 'react';
import { motion, useAnimationFrame } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

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
// ─── Corner paths for breathe patterns ───────────────────────────────────────

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

// ─── Gravity position ─────────────────────────────────────────────────────────

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

// ─── Grid point displacement ──────────────────────────────────────────────────

function displacePoint(
  px: number, py: number,
  gx: number, gy: number,
  strength: number,
): { dx: number; dy: number; influence: number } {
  const dvx      = gx - px;
  const dvy      = gy - py;
  const dist     = Math.sqrt(dvx * dvx + dvy * dvy);
  const taper    = Math.exp(-(dist * dist) / (2 * FALLOFF_SIGMA * FALLOFF_SIGMA));
  const magnitude = strength * taper;
  const softDist = dist + SOFT_RADIUS;
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

  const pathRefs        = useRef<(SVGPathElement        | null)[]>([]);
  const lineOverlayRefs = useRef<(SVGPathElement        | null)[]>([]);
  const dotBaseRefs     = useRef<(SVGCircleElement      | null)[]>([]);
  const dotOverlayRefs  = useRef<(SVGCircleElement      | null)[]>([]);
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
      sweepDirX  = 1;
      sweepDirY  = 0;
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
