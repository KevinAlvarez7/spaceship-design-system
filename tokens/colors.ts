export type ColorToken = {
  name: string;
  cssVar: string;
  description?: string;
};

export const colorPrimitives: ColorToken[] = [
  { name: 'blue-50',    cssVar: '--blue-50' },
  { name: 'blue-100',   cssVar: '--blue-100' },
  { name: 'blue-200',   cssVar: '--blue-200' },
  { name: 'blue-400',   cssVar: '--blue-400' },
  { name: 'blue-500',   cssVar: '--blue-500' },
  { name: 'blue-600',   cssVar: '--blue-600' },
  { name: 'blue-700',   cssVar: '--blue-700' },
  { name: 'zinc-50',    cssVar: '--zinc-50' },
  { name: 'zinc-100',   cssVar: '--zinc-100' },
  { name: 'zinc-200',   cssVar: '--zinc-200' },
  { name: 'zinc-300',   cssVar: '--zinc-300' },
  { name: 'zinc-400',   cssVar: '--zinc-400' },
  { name: 'zinc-500',   cssVar: '--zinc-500' },
  { name: 'zinc-600',   cssVar: '--zinc-600' },
  { name: 'zinc-700',   cssVar: '--zinc-700' },
  { name: 'zinc-800',   cssVar: '--zinc-800' },
  { name: 'zinc-900',   cssVar: '--zinc-900' },
  { name: 'zinc-950',   cssVar: '--zinc-950' },
  { name: 'red-400',    cssVar: '--red-400' },
  { name: 'red-500',    cssVar: '--red-500' },
  { name: 'red-600',    cssVar: '--red-600' },
  { name: 'green-500',  cssVar: '--green-500' },
  { name: 'yellow-500', cssVar: '--yellow-500' },
];

export type SemanticColorGroup = {
  group: string;
  tokens: ColorToken[];
};

export const colorSemantic: SemanticColorGroup[] = [
  {
    group: 'Action',
    tokens: [
      { name: 'action-primary',        cssVar: '--color-action-primary',        description: 'Primary CTA, links, focus rings' },
      { name: 'action-primary-hover',  cssVar: '--color-action-primary-hover',  description: 'Hover state for primary action' },
      { name: 'action-primary-active', cssVar: '--color-action-primary-active', description: 'Pressed/active state' },
    ],
  },
  {
    group: 'Surface',
    tokens: [
      { name: 'surface-base',    cssVar: '--color-surface-base',    description: 'Page / app background' },
      { name: 'surface-raised',  cssVar: '--color-surface-raised',  description: 'Cards, popovers, raised elements' },
      { name: 'surface-overlay', cssVar: '--color-surface-overlay', description: 'Modals, dialogs' },
      { name: 'surface-sunken',  cssVar: '--color-surface-sunken',  description: 'Input backgrounds, inset areas' },
    ],
  },
  {
    group: 'Text',
    tokens: [
      { name: 'text-primary',   cssVar: '--color-text-primary',   description: 'Body text, headings' },
      { name: 'text-secondary', cssVar: '--color-text-secondary', description: 'Supporting text, labels' },
      { name: 'text-muted',     cssVar: '--color-text-muted',     description: 'Placeholders, captions' },
      { name: 'text-disabled',  cssVar: '--color-text-disabled',  description: 'Disabled state text' },
      { name: 'text-inverse',   cssVar: '--color-text-inverse',   description: 'Text on dark surfaces' },
      { name: 'text-on-action', cssVar: '--color-text-on-action', description: 'Text on action-primary backgrounds' },
    ],
  },
  {
    group: 'Border',
    tokens: [
      { name: 'border-default', cssVar: '--color-border-default', description: 'Default dividers, input borders' },
      { name: 'border-strong',  cssVar: '--color-border-strong',  description: 'Emphasized borders' },
      { name: 'border-focus',   cssVar: '--color-border-focus',   description: 'Focus ring color' },
    ],
  },
  {
    group: 'Feedback',
    tokens: [
      { name: 'destructive',       cssVar: '--color-destructive',       description: 'Error, delete, danger' },
      { name: 'destructive-hover', cssVar: '--color-destructive-hover', description: 'Hover on destructive' },
      { name: 'success',           cssVar: '--color-success',           description: 'Success states' },
      { name: 'warning',           cssVar: '--color-warning',           description: 'Warning states' },
    ],
  },
];
