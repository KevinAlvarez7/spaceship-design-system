# Button Variant & Surface Cleanup — Design

**Date:** 2026-03-03

## Summary

Remove `outline` variant and `neo-brutalist` surface. Add `success` variant. Rename `professional` surface → `shadow`. No token changes required.

---

## Variants (final set)

| Variant | Tokens | Change |
|---|---|---|
| `primary` | `--bg-interactive-primary-*` + `--text-inverse` | unchanged |
| `secondary` | `--bg-interactive-secondary-*` + `--text-primary` | unchanged |
| `ghost` | transparent + `--bg-interactive-secondary-*` hover | unchanged |
| `success` | `--bg-interactive-success-*` + `--text-inverse` | **new** |
| `destructive` | `--bg-interactive-error-*` + `--text-inverse` | unchanged |
| ~~`outline`~~ | — | **removed** |

## Surfaces (final set)

| Surface | Effect | Change |
|---|---|---|
| `default` | flat, no shadow | unchanged |
| `shadow` | `--shadow-border` ring + `--shadow-border-hover` on hover | **renamed** from `professional` |
| ~~`neo-brutalist`~~ | — | **removed** |

## Motion

`SCALE` config updated:
- Remove `neo-brutalist` entry
- Rename `professional` key → `shadow`
- Values unchanged: `shadow` keeps `{ hover: 1.02, tap: 0.98 }`

## Files Changed

| File | Change |
|---|---|
| `components/ui/button.tsx` | Remove `outline` variant, remove `neo-brutalist` surface, rename `professional` → `shadow` in CVA and SCALE, add `success` variant |
| `app/components/[component]/ButtonPage.tsx` | Remove Outline and Neo-Brutalist sections, rename Professional → Shadow, add Success to Variants and Disabled rows, update Motion Effects (2 surfaces), update props table and usage example |

## Not Changed

- Token files — `--bg-interactive-success-*` already exists in `styles/tokens.css`
- Barrel export (`components/ui/index.ts`)
- Sizes (sm, md, lg)
- Motion spring config
- `disableMotion` prop
