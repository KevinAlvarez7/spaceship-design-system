'use client';

import { useRef, useEffect, useLayoutEffect } from 'react';

interface Vertex {
  x: number;
  y: number;
  hx: number;
  hy: number;
}

export interface GravityWellProps {
  // Physics
  radius?: number;
  mass?: number;
  softness?: number;
  spring?: number;
  // Grid
  cols?: number;
  rows?: number;
  // Visual
  className?: string;
  style?: React.CSSProperties;
  lineColorBase?: string;
  lineColorActive?: string;
  lineColors?: string[];
  dotColor?: string;
  massColor?: string;
  background?: string;
  // Multi-source (prop-based, triggers re-renders)
  sources?: Array<{ x: number; y: number; mass?: number }>;
  // Ref-based source list for zero-rerender updates. Canvas reads on each RAF tick.
  sourcesRef?: React.RefObject<Array<{ x: number; y: number; mass?: number }> | null>;
  // When true, vertices are repelled away from gravity sources instead of attracted.
  invert?: boolean;
  // When false, skips drawing the metallic mass sphere (useful when a custom element marks the gravity center).
  showMass?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

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

function lerpColor(base: string, active: string, t: number): string {
  const [r1, g1, b1, a1] = parseColor(base);
  const [r2, g2, b2, a2] = parseColor(active);
  return `rgba(${Math.round(lerp(r1, r2, t))},${Math.round(lerp(g1, g2, t))},${Math.round(lerp(b1, b2, t))},${lerp(a1, a2, t).toFixed(2)})`;
}

// Maps angle (0→2π) to a position on a pre-parsed color ring with wrapping lerp.
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

// ── Component ─────────────────────────────────────────────────────────────────

export function GravityWell({
  radius = 150,
  mass = 18,
  softness = 65,
  spring = 0.08,
  cols = 52,
  rows = 36,
  className,
  style,
  lineColorBase = '#e4e4e7',
  lineColorActive = '#d4d4d8',
  lineColors = [],
  dotColor = 'rgba(161, 161, 170, 0.18)',
  massColor = 'rgba(113, 113, 122, 0.22)',
  background = '#fafafa',
  sources = [],
  sourcesRef,
  invert = false,
  showMass = true,
}: GravityWellProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const vertsRef = useRef<Vertex[][]>([]);
  const sizeRef = useRef({ W: 0, H: 0 });
  // Holds the latest buildGrid so the [cols, rows] effect can trigger a rebuild
  const rebuildRef = useRef<() => void>(() => {});

  // Mirror all props into a ref so the animation loop always reads current
  // values without needing to re-mount. useLayoutEffect runs synchronously
  // after commit so the ref is up-to-date before the next RAF tick.
  // NOTE: sourcesRef is already a ref — do NOT add it to propsRef.
  const propsRef = useRef({
    radius, mass, softness, spring, cols, rows,
    lineColorBase, lineColorActive, lineColors, dotColor, massColor, background, sources, invert, showMass,
  });
  const parsedRingRef = useRef<[number, number, number, number][]>([]);
  useLayoutEffect(() => {
    propsRef.current = {
      radius, mass, softness, spring, cols, rows,
      lineColorBase, lineColorActive, lineColors, dotColor, massColor, background, sources, invert, showMass,
    };
    parsedRingRef.current = lineColors.map(c => parseColor(c));
  });

  // Stable mirror so the useEffect closure always sees the latest ref object
  // even when the parent re-renders and passes a new sourcesRef identity.
  const sourcesRefRef = useRef(sourcesRef);
  useLayoutEffect(() => { sourcesRefRef.current = sourcesRef; });

  // Main loop — mounts once; all prop reads go through propsRef
  useEffect(() => {
    if (!canvasRef.current) return;
    // Re-declare with explicit non-nullable types so closures capture
    // HTMLCanvasElement / CanvasRenderingContext2D directly, not the union.
    const canvas: HTMLCanvasElement = canvasRef.current;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx: CanvasRenderingContext2D = maybeCtx;

    // ── Grid ─────────────────────────────────────────────────────────────────

    function buildGrid() {
      const { cols, rows } = propsRef.current;
      const safeCols = Math.max(cols, 2);
      const safeRows = Math.max(rows, 2);
      // getBoundingClientRect reflects CSS layout; offsetWidth can be 0 before paint
      const rect = canvas.getBoundingClientRect();
      const W = Math.round(rect.width);
      const H = Math.round(rect.height);
      if (W === 0 || H === 0) return;
      canvas.width = W;
      canvas.height = H;
      sizeRef.current = { W, H };

      const cw = W / (safeCols - 1);
      const ch = H / (safeRows - 1);
      const next: Vertex[][] = [];
      for (let r = 0; r < safeRows; r++) {
        next[r] = [];
        for (let c = 0; c < safeCols; c++) {
          const hx = c * cw;
          const hy = r * ch;
          next[r][c] = { x: hx, y: hy, hx, hy };
        }
      }
      vertsRef.current = next;
    }

    rebuildRef.current = buildGrid;

    // ── Physics ───────────────────────────────────────────────────────────────
    // Analytic displacement: MASS * R² / (dist² + SOFT²), tapered at rim.
    // No velocity — vertices lerp directly toward their computed target.

    function targetPos(hx: number, hy: number): { tx: number; ty: number } {
      const { radius, mass: defaultMass, softness, invert } = propsRef.current;
      const refSrcs = sourcesRefRef.current?.current;
      const propSrcs = propsRef.current.sources;

      // Priority: sourcesRef (zero-rerender) → sources prop → cursor
      let points: Array<{ x: number; y: number; mass: number }>;
      if (refSrcs && refSrcs.length > 0) {
        points = refSrcs.map(s => ({ x: s.x, y: s.y, mass: s.mass ?? defaultMass }));
      } else if (propSrcs && propSrcs.length > 0) {
        points = propSrcs.map(s => ({ x: s.x, y: s.y, mass: s.mass ?? defaultMass }));
      } else {
        const { x, y, active } = mouseRef.current;
        if (!active) return { tx: hx, ty: hy };
        points = [{ x, y, mass: defaultMass }];
      }

      let totalDx = 0, totalDy = 0;
      for (const src of points) {
        const dx = src.x - hx;
        const dy = src.y - hy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) continue;
        const denom = dist * dist + softness * softness;
        const pull = src.mass * radius * radius / denom;
        const rim = 1 - dist / radius;
        const amount = Math.min(pull * rim * rim, dist * 0.92);
        totalDx += (dx / (dist + 0.001)) * amount;
        totalDy += (dy / (dist + 0.001)) * amount;
      }
      const sign = invert ? -1 : 1;
      return { tx: hx + sign * totalDx, ty: hy + sign * totalDy };
    }

    function update() {
      const { spring } = propsRef.current;
      for (const row of vertsRef.current) {
        for (const v of row) {
          const { tx, ty } = targetPos(v.hx, v.hy);
          v.x += (tx - v.x) * spring;
          v.y += (ty - v.y) * spring;
        }
      }
    }

    // ── Rendering ─────────────────────────────────────────────────────────────

    function vertexDisp(v: Vertex): number {
      return Math.hypot(v.x - v.hx, v.y - v.hy);
    }

    // Returns influence (0–1) and the angle (0–2π) from the dominant source.
    // Merges influence + angle into one pass to avoid traversing sources twice.
    function vertexInfluenceAndAngle(hx: number, hy: number): { influence: number; angle: number } {
      const { radius } = propsRef.current;
      const refSrcs = sourcesRefRef.current?.current;
      const propSrcs = propsRef.current.sources;

      let points: Array<{ x: number; y: number }>;
      if (refSrcs && refSrcs.length > 0) {
        points = refSrcs;
      } else if (propSrcs && propSrcs.length > 0) {
        points = propSrcs;
      } else {
        const { x, y, active } = mouseRef.current;
        if (!active) return { influence: 0, angle: 0 };
        points = [{ x, y }];
      }

      let maxInfluence = 0;
      let dominantAngle = 0;
      for (const src of points) {
        const dist = Math.hypot(src.x - hx, src.y - hy);
        if (dist >= radius) continue;
        // raw: 0 at dist=radius, 1 at dist≤radius/2
        const raw = Math.min(1, 2 * (1 - dist / radius));
        const smoothed = raw * raw * (3 - 2 * raw);
        if (smoothed > maxInfluence) {
          maxInfluence = smoothed;
          dominantAngle = ((Math.atan2(hy - src.y, hx - src.x) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        }
      }
      return { influence: maxInfluence, angle: dominantAngle };
    }

    // Compute the RGBA color + width for a single vertex.
    function vertexStyle(v: Vertex): { rgba: [number, number, number, number]; width: number } {
      const { radius, lineColorBase, lineColorActive } = propsRef.current;
      const disp = vertexDisp(v);
      const raw = Math.min(disp / (radius * 0.2), 1);
      const t = raw * raw * (3 - 2 * raw);
      const { influence, angle } = vertexInfluenceAndAngle(v.hx, v.hy);

      let r: number, g: number, b: number, a: number;
      const ring = parsedRingRef.current;
      if (ring.length > 0) {
        const [br, bg, bb, ba] = parseColor(lineColorBase);
        const [cr, cg, cb, ca] = sampleColorRing(angle, ring);
        r = lerp(br, cr, t);
        g = lerp(bg, cg, t);
        b = lerp(bb, cb, t);
        a = lerp(ba, ca, t);
      } else {
        [r, g, b, a] = parseColor(lerpColor(lineColorBase, lineColorActive, t));
      }

      return {
        rgba: [Math.round(r), Math.round(g), Math.round(b), a * influence],
        width: lerp(0.55, 1.4, t),
      };
    }

    function rgbaStr([r, g, b, a]: [number, number, number, number]): string {
      return `rgba(${r},${g},${b},${a.toFixed(3)})`;
    }

    // Per-segment bezier rendering with linear gradients — smooth color transitions
    // between adjacent vertices eliminate the discrete color-band artifact.
    function drawLinePerSegment(pts: Vertex[]) {
      if (pts.length < 2) return;
      let sx = pts[0].x, sy = pts[0].y;
      for (let i = 0; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) * 0.5;
        const my = (pts[i].y + pts[i + 1].y) * 0.5;
        const s0 = vertexStyle(pts[i]);
        const s1 = vertexStyle(pts[i + 1]);
        const grad = ctx.createLinearGradient(sx, sy, mx, my);
        grad.addColorStop(0, rgbaStr(s0.rgba));
        grad.addColorStop(1, rgbaStr(s1.rgba));
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        ctx.strokeStyle = grad;
        ctx.lineWidth = (s0.width + s1.width) * 0.5;
        ctx.stroke();
        sx = mx;
        sy = my;
      }
      // Final straight segment to last vertex
      const last = pts[pts.length - 1];
      const secondLast = pts[pts.length - 2];
      const sA = vertexStyle(secondLast);
      const sB = vertexStyle(last);
      const grad = ctx.createLinearGradient(sx, sy, last.x, last.y);
      grad.addColorStop(0, rgbaStr(sA.rgba));
      grad.addColorStop(1, rgbaStr(sB.rgba));
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(last.x, last.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = (sA.width + sB.width) * 0.5;
      ctx.stroke();
    }

    function drawBg() {
      const { W, H } = sizeRef.current;
      const { dotColor, background } = propsRef.current;
      const step = 38;

      if (background && background !== 'transparent') {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, W, H);
      }

      // Static dot grid
      ctx.fillStyle = dotColor;
      for (let x = step / 2; x < W; x += step) {
        for (let y = step / 2; y < H; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Faint static line grid
      ctx.strokeStyle = 'rgba(161, 161, 170, 0.07)';  // neutral-400 @ 7%
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      for (let x = step / 2; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = step / 2; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
    }

    function drawGrid() {
      const verts = vertsRef.current;
      for (let r = 0; r < verts.length; r++) {
        drawLinePerSegment(verts[r]);
      }
      const colCount = verts[0]?.length ?? 0;
      for (let c = 0; c < colCount; c++) {
        const col = verts.map(row => row[c]);
        drawLinePerSegment(col);
      }
    }

    function drawOneMass(cx: number, cy: number) {
      const { massColor } = propsRef.current;

      // Tight shadow just under the ball
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
      glow.addColorStop(0, massColor);
      glow.addColorStop(1, 'rgba(63, 63, 70, 0.00)');      // transparent
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Planet body
      const body = ctx.createRadialGradient(cx - 3, cy - 3, 0.5, cx, cy, 9);
      body.addColorStop(0, 'rgba(250, 250, 250, 1.00)');    // neutral-50
      body.addColorStop(0.5, 'rgba(161, 161, 170, 0.90)');  // neutral-400
      body.addColorStop(1, 'rgba(63, 63, 70, 0.70)');       // neutral-700
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();
    }

    function drawMass() {
      const refSrcs = sourcesRefRef.current?.current;
      const propSrcs = propsRef.current.sources;
      if (refSrcs && refSrcs.length > 0) {
        for (const src of refSrcs) drawOneMass(src.x, src.y);
      } else if (propSrcs && propSrcs.length > 0) {
        for (const src of propSrcs) drawOneMass(src.x, src.y);
      } else {
        const { active, x: cx, y: cy } = mouseRef.current;
        if (!active) return;
        drawOneMass(cx, cy);
      }
    }

    // ── Loop ──────────────────────────────────────────────────────────────────

    function loop() {
      const { W, H } = sizeRef.current;
      update();
      ctx.clearRect(0, 0, W, H);
      drawBg();
      drawGrid();
      if (propsRef.current.showMass !== false) drawMass();
      rafRef.current = requestAnimationFrame(loop);
    }

    // ── Events ────────────────────────────────────────────────────────────────

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    }

    function onMouseLeave() {
      mouseRef.current.active = false;
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top, active: true };
    }

    function onTouchEnd() {
      mouseRef.current.active = false;
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    buildGrid();

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    const ro = new ResizeObserver(buildGrid);
    ro.observe(canvas.parentElement ?? canvas);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      ro.disconnect();
    };
  }, []); // intentionally empty — all prop reads go through propsRef

  // Rebuild grid when grid dimensions change (other props update via propsRef)
  useEffect(() => {
    rebuildRef.current();
  }, [cols, rows]);

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
