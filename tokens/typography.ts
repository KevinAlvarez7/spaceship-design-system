export type TypographyToken = {
  name: string;
  cssVar: string;
  value: string;
};

export const fontFamilies: TypographyToken[] = [
  { name: 'base', cssVar: '--font-family-base', value: 'Inter, system-ui, sans-serif' },
  { name: 'mono', cssVar: '--font-family-mono', value: 'JetBrains Mono, monospace' },
];

export const fontSizes: TypographyToken[] = [
  { name: 'xs',   cssVar: '--text-xs',   value: '0.75rem / 12px' },
  { name: 'sm',   cssVar: '--text-sm',   value: '0.875rem / 14px' },
  { name: 'base', cssVar: '--text-base', value: '0.9375rem / 15px' },
  { name: 'lg',   cssVar: '--text-lg',   value: '1.125rem / 18px' },
  { name: 'xl',   cssVar: '--text-xl',   value: '1.375rem / 22px' },
  { name: '2xl',  cssVar: '--text-2xl',  value: '1.75rem / 28px' },
  { name: '3xl',  cssVar: '--text-3xl',  value: '2.25rem / 36px' },
];

export const fontWeights: TypographyToken[] = [
  { name: 'regular',  cssVar: '--font-regular',  value: '400' },
  { name: 'medium',   cssVar: '--font-medium',   value: '500' },
  { name: 'semibold', cssVar: '--font-semibold', value: '600' },
  { name: 'bold',     cssVar: '--font-bold',     value: '700' },
];

export const lineHeights: TypographyToken[] = [
  { name: 'none',    cssVar: '--leading-none',    value: '1' },
  { name: 'tight',   cssVar: '--leading-tight',   value: '1.25' },
  { name: 'snug',    cssVar: '--leading-snug',    value: '1.375' },
  { name: 'normal',  cssVar: '--leading-normal',  value: '1.5' },
  { name: 'relaxed', cssVar: '--leading-relaxed', value: '1.625' },
];

export const letterSpacings: TypographyToken[] = [
  { name: 'tight',  cssVar: '--tracking-tight',  value: '-0.02em' },
  { name: 'normal', cssVar: '--tracking-normal', value: '0em' },
  { name: 'wide',   cssVar: '--tracking-wide',   value: '0.02em' },
  { name: 'wider',  cssVar: '--tracking-wider',  value: '0.05em' },
];

export type TypeSpecimen = {
  name: string;
  label: string;
  className: string;
  sample: string;
};

export const typeSpecimens: TypeSpecimen[] = [
  {
    name: 'display',
    label: 'Display',
    className: 'text-[var(--text-3xl)] font-[var(--font-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]',
    sample: 'The quick brown fox',
  },
  {
    name: 'heading-xl',
    label: 'Heading XL',
    className: 'text-[var(--text-2xl)] font-[var(--font-bold)] leading-[var(--leading-tight)]',
    sample: 'Design systems scale quality',
  },
  {
    name: 'heading-lg',
    label: 'Heading LG',
    className: 'text-[var(--text-xl)] font-[var(--font-semibold)] leading-[var(--leading-snug)]',
    sample: 'Tokens, Components, Patterns',
  },
  {
    name: 'heading-md',
    label: 'Heading MD',
    className: 'text-[var(--text-lg)] font-[var(--font-semibold)] leading-[var(--leading-snug)]',
    sample: 'Consistent, scalable UI',
  },
  {
    name: 'body-base',
    label: 'Body Base',
    className: 'text-[var(--text-base)] font-[var(--font-regular)] leading-[var(--leading-normal)]',
    sample: 'The primary reading size. Used for paragraphs, descriptions, and most UI content.',
  },
  {
    name: 'body-sm',
    label: 'Body SM',
    className: 'text-[var(--text-sm)] font-[var(--font-regular)] leading-[var(--leading-normal)]',
    sample: 'Secondary body text. Form labels, supporting descriptions, sidebar content.',
  },
  {
    name: 'label',
    label: 'Label',
    className: 'text-[var(--text-sm)] font-[var(--font-medium)] leading-[var(--leading-normal)] tracking-[var(--tracking-wide)]',
    sample: 'Form label · UI label · Tag',
  },
  {
    name: 'caption',
    label: 'Caption',
    className: 'text-[var(--text-xs)] font-[var(--font-regular)] leading-[var(--leading-normal)] text-[var(--color-text-muted)]',
    sample: 'Timestamp · Metadata · Fine print',
  },
  {
    name: 'mono',
    label: 'Mono',
    className: 'text-[var(--text-sm)] font-[var(--font-regular)] leading-[var(--leading-relaxed)] font-[family-name:var(--font-family-mono)]',
    sample: 'const token = "var(--color-action-primary)";',
  },
];
