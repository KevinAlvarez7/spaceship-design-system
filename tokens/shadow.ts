export type ShadowToken = {
  name: string;
  cssVar: string;
  description: string;
};

export const shadowTokens: ShadowToken[] = [
  { name: 'none', cssVar: '--shadow-none', description: 'No elevation' },
  { name: 'sm',   cssVar: '--shadow-sm',   description: 'Subtle depth. Inputs, inline elements.' },
  { name: 'md',   cssVar: '--shadow-md',   description: 'Cards, dropdowns, popovers.' },
  { name: 'lg',   cssVar: '--shadow-lg',   description: 'Dialogs, modals, floating panels.' },
  { name: 'xl',   cssVar: '--shadow-xl',   description: 'Commanding elevation. Full-screen overlays.' },
];
