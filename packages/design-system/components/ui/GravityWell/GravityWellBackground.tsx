import type { ReactNode } from 'react';
import { GravityWell, type GravityWellProps } from './GravityWell';

export interface GravityWellBackgroundProps extends GravityWellProps {
  children?: ReactNode;
}

/**
 * Convenience wrapper that renders GravityWell as an absolute background
 * layer behind children. The outer div fills its parent (width/height 100%).
 *
 * Usage:
 *   <div style={{ position: 'relative', height: 400 }}>
 *     <GravityWellBackground>
 *       <p>Content rendered over the effect</p>
 *     </GravityWellBackground>
 *   </div>
 */
export function GravityWellBackground({ children, ...gravityWellProps }: GravityWellBackgroundProps) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GravityWell {...gravityWellProps} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
