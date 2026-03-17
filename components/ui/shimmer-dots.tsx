'use client';

import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ShimmerDotsProps extends React.HTMLAttributes<HTMLSpanElement> {
  disableMotion?: boolean;
  /** Animation style. 'rainbow' = cycling hue sweep (default). 'subtle' = secondary→white sweep. */
  variant?: 'rainbow' | 'subtle';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ShimmerDots({
  disableMotion = false,
  variant = 'rainbow',
  className,
  ...props
}: ShimmerDotsProps) {
  if (disableMotion) {
    return (
      <span aria-hidden="true" className={cn('text-(--text-secondary)', className)} {...props}>
        {'\u2026'}
      </span>
    );
  }

  if (variant === 'subtle') {
    return (
      <span aria-hidden="true" className={className} {...props}>
        <span className="shimmer-dot-subtle shimmer-dot-subtle-1">.</span>
        <span className="shimmer-dot-subtle shimmer-dot-subtle-2">.</span>
        <span className="shimmer-dot-subtle shimmer-dot-subtle-3">.</span>
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={className} {...props}>
      <span className="thinking-dot-bounce thinking-dot-1">.</span>
      <span className="thinking-dot-bounce thinking-dot-2">.</span>
      <span className="thinking-dot-bounce thinking-dot-3">.</span>
    </span>
  );
}
