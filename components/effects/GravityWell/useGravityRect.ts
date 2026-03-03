'use client';

import { useRef, useEffect } from 'react';
import type { GravitySource } from './GravityWell';

export interface UseGravityRectOptions {
  mass?: number;      // per-corner mass (default 2)
  enabled?: boolean;  // toggle on/off (default true)
  inset?: number;     // pull corners inward to match border-radius (default 0)
}

export function useGravityRect(
  elementRef: React.RefObject<HTMLElement | null>,
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseGravityRectOptions = {},
): React.RefObject<GravitySource[]> {
  const { mass = 2, enabled = true, inset = 0 } = options;
  const sourcesRef = useRef<GravitySource[]>([]);

  useEffect(() => {
    if (!enabled || !elementRef.current) {
      sourcesRef.current = [];
      return;
    }

    function update() {
      const el = elementRef.current;
      const container = containerRef.current;
      if (!el || !container) { sourcesRef.current = []; return; }

      const elRect = el.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      const l = elRect.left - cRect.left + inset;
      const r = elRect.right - cRect.left - inset;
      const t = elRect.top - cRect.top + inset;
      const b = elRect.bottom - cRect.top - inset;

      sourcesRef.current = [
        { x: l, y: t, mass },
        { x: r, y: t, mass },
        { x: l, y: b, mass },
        { x: r, y: b, mass },
      ];
    }

    update();

    const ro = new ResizeObserver(update);
    ro.observe(elementRef.current);
    window.addEventListener('scroll', update, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, [elementRef, containerRef, mass, enabled, inset]);

  return sourcesRef;
}
