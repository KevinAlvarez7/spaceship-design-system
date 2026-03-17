export type MotionToken = {
  name: string;
  cssVar: string;
  value: string;
};

export const durationTokens: MotionToken[] = [
  { name: 'instant', cssVar: '--duration-instant', value: '50ms' },
  { name: 'fast',    cssVar: '--duration-fast',    value: '100ms' },
  { name: 'base',    cssVar: '--duration-base',    value: '200ms' },
  { name: 'slow',    cssVar: '--duration-slow',    value: '300ms' },
  { name: 'slower',  cssVar: '--duration-slower',  value: '500ms' },
];

export const easingTokens: MotionToken[] = [
  { name: 'linear',    cssVar: '--ease-linear',   value: 'linear' },
  { name: 'ease-in',   cssVar: '--ease-in',        value: 'cubic-bezier(0.4, 0, 1, 1)' },
  { name: 'ease-out',  cssVar: '--ease-out',       value: 'cubic-bezier(0, 0, 0.2, 1)' },
  { name: 'ease-in-out', cssVar: '--ease-in-out',  value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  { name: 'spring',    cssVar: '--ease-spring',    value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
];

/* ------------------------------------------------------------------ */
/*  Framer Motion presets (JS-only — not CSS custom properties)       */
/* ------------------------------------------------------------------ */

/** Spring transition preset for motion/react components. */
export type SpringPreset = {
  type: 'spring';
  stiffness: number;
  damping: number;
};

/** Scale interaction preset (hover + tap) for motion/react components. */
export type ScalePreset = {
  hover: number;
  tap: number;
};

/**
 * Named spring presets — import directly into DS components.
 * Rule: damping ratio ζ = damping / (2 × √stiffness) must be ≥ 0.7.
 */
export const springs = {
  interactive: { type: 'spring' as const, stiffness: 400, damping: 30 },
  gentle:      { type: 'spring' as const, stiffness: 160, damping: 24 },  // ζ ≈ 0.95 — slow, no overshoot
} satisfies Record<string, SpringPreset>;

/**
 * Named scale presets — import directly into DS components.
 */
export const scales = {
  prominent: { hover: 0.98, tap: 0.94 },
  subtle:    { hover: 0.98, tap: 0.94 },
} satisfies Record<string, ScalePreset>;

/* Viewer display arrays */

export type FramerMotionToken = {
  name: string;
  value: string;  
  usedBy: string;
};

export const springPresetTokens: FramerMotionToken[] = [
  { name: 'interactive', value: 'stiffness: 400, damping: 30 (ζ ≈ 0.75)', usedBy: 'Button' },
  { name: 'gentle',      value: 'stiffness: 160, damping: 24 (ζ ≈ 0.95)', usedBy: 'ThinkingDots' },
];

export const scalePresetTokens: FramerMotionToken[] = [
  { name: 'prominent', value: 'hover: 0.99, tap: 0.95', usedBy: 'Button (default surface)' },
  { name: 'subtle',    value: 'hover: 0.99, tap: 0.95', usedBy: 'Button (shadow surface)' },
];
