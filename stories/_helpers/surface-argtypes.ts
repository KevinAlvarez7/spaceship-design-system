/**
 * Shared argType definition for the common `surface` variant.
 * Spread into a story's `argTypes` for components that use `default` / `shadow-border` surfaces.
 *
 * Note: Button uses `flat` / `shadow` — define its surface argType inline.
 */
export const SURFACE_ARGTYPES = {
  surface: {
    control: { type: 'select' },
    options: ['default', 'shadow-border'],
    table: { category: 'Variants' },
  },
} as const;
