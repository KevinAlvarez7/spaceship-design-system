'use client';

import { useRef, useEffect } from 'react';

export interface GridBackgroundProps {
  background?: string;
  dotColor?: string;
  staticGridColor?: string;
  showDots?: boolean;
  showStaticGrid?: boolean;
  step?: number;
  dotRadius?: number;
  lineWidth?: number;
  /** Angle-based color ring (radial rainbow). Overrides dotColor/staticGridColor per-element when non-empty. */
  colorRing?: string[];
  /** Draw a heavier major line every N cells. 0 = disabled. */
  majorEvery?: number;
  /** Stroke width of major grid lines in pixels. */
  majorLineWidth?: number;
  /** Color for major grid lines. Defaults to staticGridColor when unset. */
  majorGridColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const CSS_VAR_RE = /^var\(\s*(--[^,)]+)\s*(?:,\s*(.+?))?\s*\)$/;

function resolveColor(value: string, element: Element): string {
  const match = value.match(CSS_VAR_RE);
  if (!match) return value;
  const resolved = getComputedStyle(element).getPropertyValue(match[1]).trim();
  return resolved || match[2] || value;
}

// ── Color ring helpers ────────────────────────────────────────────────────────

/** Linear interpolation between two values. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Parses a hex or rgba() string into an [r, g, b, a] tuple. */
function parseColor(str: string): [number, number, number, number] {
  const hex = str.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (h.length === 6) h += 'ff';
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      parseInt(h.slice(6, 8), 16) / 255,
    ];
  }
  const m = str.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*(\d+(?:\.\d+)?))?\s*\)/,
  );
  if (!m) return [0, 0, 0, 1];
  return [
    parseFloat(m[1]),
    parseFloat(m[2]),
    parseFloat(m[3]),
    m[4] !== undefined ? parseFloat(m[4]) : 1,
  ];
}

/** Maps angle (0→2π) to an interpolated color from a pre-parsed ring with wrapping lerp. */
function sampleColorRing(
  angle: number,
  ring: [number, number, number, number][],
): [number, number, number, number] {
  const n = ring.length;
  const a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const frac = (a / (Math.PI * 2)) * n;
  const i0 = Math.floor(frac) % n;
  const i1 = (i0 + 1) % n;
  const t = frac - Math.floor(frac);
  const [r0, g0, b0, a0] = ring[i0];
  const [r1, g1, b1, a1] = ring[i1];
  return [lerp(r0, r1, t), lerp(g0, g1, t), lerp(b0, b1, t), lerp(a0, a1, t)];
}

/** Converts an [r, g, b, a] tuple to an rgba() CSS string. */
function toRgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a.toFixed(2)})`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GridBackground({
  background = '#ffffff',
  dotColor = 'var(--effect-gravity-dot, rgba(161, 161, 170, 0.32))',
  staticGridColor = 'rgba(147, 197, 230, 0.38)',
  showDots = false,
  showStaticGrid = true,
  step = 28,
  dotRadius = 0.9,
  lineWidth = 0.4,
  colorRing = [],
  majorEvery = 0,
  majorLineWidth = 1.0,
  majorGridColor,
  className,
  style,
}: GridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const W = Math.round(rect.width);
      const H = Math.round(rect.height);
      if (W === 0 || H === 0) return;
      canvas.width = W;
      canvas.height = H;

      const bg = resolveColor(background, canvas);
      const dot = resolveColor(dotColor, canvas);
      const grid = resolveColor(staticGridColor, canvas);

      if (bg && bg !== 'transparent') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
      }

      // Pre-parse the color ring once per draw (resolve CSS vars first)
      const ring = colorRing.map(c => parseColor(resolveColor(c, canvas)));
      const useRing = ring.length > 0;
      const cx = W / 2;
      const cy = H / 2;

      if (showDots) {
        if (useRing) {
          for (let x = step / 2; x < W; x += step) {
            for (let y = step / 2; y < H; y += step) {
              const angle = Math.atan2(y - cy, x - cx);
              const [r, g, b, a] = sampleColorRing(angle, ring);
              ctx.fillStyle = toRgba(r, g, b, a);
              ctx.beginPath();
              ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else {
          ctx.fillStyle = dot;
          for (let x = step / 2; x < W; x += step) {
            for (let y = step / 2; y < H; y += step) {
              ctx.beginPath();
              ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      if (showStaticGrid) {
        ctx.lineWidth = lineWidth;

        if (useRing) {
          // Break each grid line into per-cell segments colored by angle from center
          // Vertical lines
          const yStops = [0];
          for (let sy = step / 2; sy < H; sy += step) yStops.push(sy);
          yStops.push(H);

          for (let x = step / 2; x < W; x += step) {
            for (let i = 0; i < yStops.length - 1; i++) {
              const y1 = yStops[i];
              const y2 = yStops[i + 1];
              const angle = Math.atan2((y1 + y2) / 2 - cy, x - cx);
              const [r, g, b, a] = sampleColorRing(angle, ring);
              ctx.strokeStyle = toRgba(r, g, b, a);
              ctx.beginPath();
              ctx.moveTo(x, y1);
              ctx.lineTo(x, y2);
              ctx.stroke();
            }
          }

          // Horizontal lines
          const xStops = [0];
          for (let sx = step / 2; sx < W; sx += step) xStops.push(sx);
          xStops.push(W);

          for (let y = step / 2; y < H; y += step) {
            for (let i = 0; i < xStops.length - 1; i++) {
              const x1 = xStops[i];
              const x2 = xStops[i + 1];
              const angle = Math.atan2(y - cy, (x1 + x2) / 2 - cx);
              const [r, g, b, a] = sampleColorRing(angle, ring);
              ctx.strokeStyle = toRgba(r, g, b, a);
              ctx.beginPath();
              ctx.moveTo(x1, y);
              ctx.lineTo(x2, y);
              ctx.stroke();
            }
          }
        } else {
          ctx.strokeStyle = grid;
          ctx.beginPath();
          for (let x = step / 2; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
          for (let y = step / 2; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
          ctx.stroke();
        }

        // ── Major grid pass ───────────────────────────────────────────────────
        if (majorEvery > 0) {
          const majorStep = step * majorEvery;
          const majorColor = majorGridColor ? resolveColor(majorGridColor, canvas) : grid;
          ctx.lineWidth = majorLineWidth;

          if (useRing) {
            const yStopsMaj = [0];
            for (let sy = step / 2; sy < H; sy += step) yStopsMaj.push(sy);
            yStopsMaj.push(H);

            for (let x = majorStep / 2; x < W; x += majorStep) {
              for (let i = 0; i < yStopsMaj.length - 1; i++) {
                const y1 = yStopsMaj[i];
                const y2 = yStopsMaj[i + 1];
                const angle = Math.atan2((y1 + y2) / 2 - cy, x - cx);
                const [r, g, b, a] = sampleColorRing(angle, ring);
                ctx.strokeStyle = toRgba(r, g, b, a);
                ctx.beginPath();
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
                ctx.stroke();
              }
            }

            const xStopsMaj = [0];
            for (let sx = step / 2; sx < W; sx += step) xStopsMaj.push(sx);
            xStopsMaj.push(W);

            for (let y = majorStep / 2; y < H; y += majorStep) {
              for (let i = 0; i < xStopsMaj.length - 1; i++) {
                const x1 = xStopsMaj[i];
                const x2 = xStopsMaj[i + 1];
                const angle = Math.atan2(y - cy, (x1 + x2) / 2 - cx);
                const [r, g, b, a] = sampleColorRing(angle, ring);
                ctx.strokeStyle = toRgba(r, g, b, a);
                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.stroke();
              }
            }
          } else {
            ctx.strokeStyle = majorColor;
            ctx.beginPath();
            for (let x = majorStep / 2; x < W; x += majorStep) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
            for (let y = majorStep / 2; y < H; y += majorStep) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
            ctx.stroke();
          }
        }
      }
    }

    draw();

    const ro = new ResizeObserver(draw);
    ro.observe(canvas.parentElement ?? canvas);

    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [background, dotColor, staticGridColor, showDots, showStaticGrid, step, dotRadius, lineWidth, colorRing, majorEvery, majorLineWidth, majorGridColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  );
}
