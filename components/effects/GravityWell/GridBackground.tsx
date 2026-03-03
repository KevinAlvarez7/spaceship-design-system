'use client';

import { useRef, useEffect } from 'react';

export interface GridBackgroundProps {
  background?: string;
  dotColor?: string;
  staticGridColor?: string;
  showDots?: boolean;
  showStaticGrid?: boolean;
  step?: number;
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

export function GridBackground({
  background = 'var(--neutral-50, #fafafa)',
  dotColor = 'var(--effect-gravity-dot, rgba(161, 161, 170, 0.32))',
  staticGridColor = 'var(--effect-gravity-grid, rgba(161, 161, 170, 0.13))',
  showDots = true,
  showStaticGrid = true,
  step = 38,
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

      if (showDots) {
        ctx.fillStyle = dot;
        for (let x = step / 2; x < W; x += step) {
          for (let y = step / 2; y < H; y += step) {
            ctx.beginPath();
            ctx.arc(x, y, 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (showStaticGrid) {
        ctx.strokeStyle = grid;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        for (let x = step / 2; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        for (let y = step / 2; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
        ctx.stroke();
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
  }, [background, dotColor, staticGridColor, showDots, showStaticGrid, step]);

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
