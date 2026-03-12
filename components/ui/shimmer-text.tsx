'use client';

import { useRef, type ReactNode } from 'react';
import { useAnimationFrame } from 'motion/react';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ShimmerTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  disableMotion?: boolean;
  /** Animation style. 'blob' = JS-driven radial blobs (default). 'linear' = pure-CSS sweep. */
  variant?: 'blob' | 'linear';
  children?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ShimmerText({
  disableMotion = false,
  variant = 'blob',
  children,
  className,
  ...props
}: ShimmerTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useAnimationFrame((time) => {
    // Only runs for blob variant
    if (disableMotion || variant !== 'blob' || !ref.current) return;

    const t   = (time / 1000 / 3) % 1;   // 3s wobble cycle
    const tau = t * 2 * Math.PI;

    // Sawtooth: each blob travels -50% → 150% (200% range), wraps every 4s
    const drift = (time / 1000 / 4) % 1;
    const g1x = -50 + (drift * 200) + Math.sin(tau) * 12;
    const g2x = -50 + (((drift + 0.333) % 1) * 200) + Math.sin(tau * 1.3 + 2.1) * 12;
    const g3x = -50 + (((drift + 0.666) % 1) * 200) + Math.sin(tau * 0.8 + 4.2) * 12;

    // Y wobble: Lissajous vertical motion
    const g1y = 50 + Math.cos(tau * 0.7) * 30;
    const g2y = 50 + Math.cos(tau * 0.9 + 0.8) * 30;
    const g3y = 50 + Math.cos(tau * 1.1 + 3.5) * 30;

    const el = ref.current;
    el.style.setProperty('--_g1-x', `${g1x}%`);
    el.style.setProperty('--_g1-y', `${g1y}%`);
    el.style.setProperty('--_g2-x', `${g2x}%`);
    el.style.setProperty('--_g2-y', `${g2y}%`);
    el.style.setProperty('--_g3-x', `${g3x}%`);
    el.style.setProperty('--_g3-y', `${g3y}%`);
  });

  if (disableMotion) {
    return (
      <span className={cn('text-(--text-secondary)', className)} {...props}>
        {children}
      </span>
    );
  }

  if (variant === 'linear') {
    return (
      <span className={cn('shimmer-text-linear', className)} {...props}>
        {children}
      </span>
    );
  }

  // variant === 'blob' (default)
  return (
    <span
      ref={ref}
      className={cn('thinking-text-animated', className)}
      {...props}
    >
      {children}
    </span>
  );
}
