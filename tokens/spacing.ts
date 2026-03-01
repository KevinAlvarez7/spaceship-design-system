export type SpacingToken = {
  name: string;
  cssVar: string;
  remValue: string;
  pxValue: string;
};

export const spacingTokens: SpacingToken[] = [
  { name: 'space-0',  cssVar: '--space-0',  remValue: '0',       pxValue: '0px' },
  { name: 'space-1',  cssVar: '--space-1',  remValue: '0.25rem', pxValue: '4px' },
  { name: 'space-2',  cssVar: '--space-2',  remValue: '0.5rem',  pxValue: '8px' },
  { name: 'space-3',  cssVar: '--space-3',  remValue: '0.75rem', pxValue: '12px' },
  { name: 'space-4',  cssVar: '--space-4',  remValue: '1rem',    pxValue: '16px' },
  { name: 'space-5',  cssVar: '--space-5',  remValue: '1.25rem', pxValue: '20px' },
  { name: 'space-6',  cssVar: '--space-6',  remValue: '1.5rem',  pxValue: '24px' },
  { name: 'space-8',  cssVar: '--space-8',  remValue: '2rem',    pxValue: '32px' },
  { name: 'space-10', cssVar: '--space-10', remValue: '2.5rem',  pxValue: '40px' },
  { name: 'space-12', cssVar: '--space-12', remValue: '3rem',    pxValue: '48px' },
  { name: 'space-16', cssVar: '--space-16', remValue: '4rem',    pxValue: '64px' },
  { name: 'space-20', cssVar: '--space-20', remValue: '5rem',    pxValue: '80px' },
  { name: 'space-24', cssVar: '--space-24', remValue: '6rem',    pxValue: '96px' },
];
