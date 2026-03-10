// Tailwind v4 built-in spacing scale (4px-grid multipliers: N × 4px).
// No custom CSS variables — use native Tailwind utilities directly (e.g. `px-4`, `gap-3`).

export type SpacingToken = {
  name: string;
  remValue: string;
  pxValue: string;
};

export const spacingTokens: SpacingToken[] = [
  { name: 'spacing-0',    remValue: '0',        pxValue: '0px' },
  { name: 'spacing-0.5',  remValue: '0.125rem', pxValue: '2px' },
  { name: 'spacing-1',    remValue: '0.25rem',  pxValue: '4px' },
  { name: 'spacing-1.5',  remValue: '0.375rem', pxValue: '6px' },
  { name: 'spacing-2',    remValue: '0.5rem',   pxValue: '8px' },
  { name: 'spacing-2.5',  remValue: '0.625rem', pxValue: '10px' },
  { name: 'spacing-3',    remValue: '0.75rem',  pxValue: '12px' },
  { name: 'spacing-3.5',  remValue: '0.875rem', pxValue: '14px' },
  { name: 'spacing-4',    remValue: '1rem',     pxValue: '16px' },
  { name: 'spacing-5',    remValue: '1.25rem',  pxValue: '20px' },
  { name: 'spacing-6',    remValue: '1.5rem',   pxValue: '24px' },
  { name: 'spacing-8',    remValue: '2rem',     pxValue: '32px' },
  { name: 'spacing-10',   remValue: '2.5rem',   pxValue: '40px' },
  { name: 'spacing-12',   remValue: '3rem',     pxValue: '48px' },
  { name: 'spacing-16',   remValue: '4rem',     pxValue: '64px' },
  { name: 'spacing-20',   remValue: '5rem',     pxValue: '80px' },
  { name: 'spacing-24',   remValue: '6rem',     pxValue: '96px' },
  { name: 'spacing-32',   remValue: '8rem',     pxValue: '128px' },
];
