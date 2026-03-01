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
