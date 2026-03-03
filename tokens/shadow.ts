export type ShadowToken = {
  name: string;
  cssVar: string;
  description: string;
};

export const shadowTokens: ShadowToken[] = [
  { name: 'border',      cssVar: '--shadow-border',      description: 'Shadow-border. Replaces CSS border with depth-aware shadow ring.' },
  { name: 'border-hover', cssVar: '--shadow-border-hover', description: 'Shadow-border hover. Increased opacity for interactive feedback.' },
];
