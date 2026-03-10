// Tailwind v4 built-in border-radius scale — no custom CSS variables needed.
// Values match Tailwind defaults; components use native rounded-* utilities.

export type RadiusToken = {
  name: string;
  twClass: string;
  value: string;
};

export const radiusTokens: RadiusToken[] = [
  { name: 'none',  twClass: 'rounded-none', value: '0' },
  { name: 'xs',   twClass: 'rounded-xs',   value: '2px' },
  { name: 'sm',   twClass: 'rounded-sm',   value: '4px' },
  { name: 'md',   twClass: 'rounded-md',   value: '6px' },
  { name: 'lg',   twClass: 'rounded-lg',   value: '8px' },
  { name: 'xl',   twClass: 'rounded-xl',   value: '12px' },
  { name: '2xl',  twClass: 'rounded-2xl',  value: '16px' },
  { name: '3xl',  twClass: 'rounded-3xl',  value: '24px' },
  { name: 'full', twClass: 'rounded-full', value: '9999px' },
];
