# Button: Typography Tokens + Surface Variants — Design

Date: 2026-03-02

## Problem

The `Button` component has two gaps:

1. **Typography not fully tokenized.** Font family and line height are not wired to tokens — they inherit or are unset, meaning button text isn't fully controlled by the DS token chain.
2. **Surface naming is unclear.** The `surface` prop values `default` and `shadow-border` are implementation-level names, not intent-level names.

---

## Changes

### 1. Typography tokens

Apply the `label` type specimen to button text. All properties wired through `var(--token)`:

| Property | Token | Size scope |
|---|---|---|
| `font-family` | `var(--font-family-secondary)` | base (all sizes) |
| `font-size` | `var(--font-size-sm)` / `var(--font-size-base)` | already on sm/md and lg |
| `font-weight` | `var(--font-weight-semibold)` | already on base |
| `line-height` | `var(--line-height-sm)` | sm, md |
| `line-height` | `var(--line-height-base)` | lg |

### 2. Surface variants — renamed and simplified

Replace `default` | `shadow-border` with three named intent values:

| Value | Behavior | Applies to |
|---|---|---|
| `default` | No border, no shadow — flat baseline | all variants |
| `neo-brutalist` | `border-2 border-[var(--border-default)]` | all variants, uniform |
| `professional` | `shadow-[var(--shadow-border)]` + hover lift | all variants |

**Key decisions:**
- `neo-brutalist` border is **uniform** across all button variants — same `--border-default` regardless of `variant` (primary, outline, etc.)
- The old per-variant compound borders (secondary 1px, outline focus-colored) are removed. `default` surface is now truly flat.
- Since neo-brutalist and professional apply the same class regardless of `variant`, they move directly into the `surface` variant map — **no compound variants needed** for surface.
- Hard offset shadows for neo-brutalist are deferred; a shadow token will be added separately.

---

## Files to change

| File | Change |
|---|---|
| `components/ui/button.tsx` | Add font-family + line-height to base/sizes; replace surface values; remove old compound variants |

---

## Non-goals

- No changes to button `variant` values (primary, secondary, outline, ghost, destructive).
- No changes to `size` values or spacing.
- No hard offset shadow token — that comes in a follow-up.
