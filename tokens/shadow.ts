export type ShadowToken = {
  name: string;
  cssVar: string;
  description: string;
};

export const shadowTokens: ShadowToken[] = [
  { name: 'border',          cssVar: '--shadow-border',          description: 'Shadow-border. Replaces CSS border with depth-aware shadow ring.' },
  { name: 'border-hover',    cssVar: '--shadow-border-hover',    description: 'Shadow-border hover. Increased opacity for interactive feedback.' },
  { name: 'keycap',         cssVar: '--shadow-keycap',         description: 'Keycap resting. 3-layer Jakub system: outline ring + softness + flat depth.' },
  { name: 'keycap-hover',   cssVar: '--shadow-keycap-hover',   description: 'Keycap hover. Increased opacity for interactive feedback.' },
  { name: 'keycap-pressed', cssVar: '--shadow-keycap-pressed', description: 'Keycap pressed. Depth layer zeroed out — key sinks to surface.' },
];
