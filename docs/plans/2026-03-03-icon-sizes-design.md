# Icon Sizes — Design

**Date:** 2026-03-03

## Context

The Icons page (`/assets/icons`) currently renders each Lucide icon at a single arbitrary size (`h-8 w-8` / 32px). The design system uses three standard icon sizes, each with a paired stroke width. This design adds those sizes to the registry and shows all three simultaneously on each `LucideIconCard`.

---

## Standard Sizes

| Label | Size   | strokeWidth |
|-------|--------|-------------|
| sm    | 16×16  | 2           |
| md    | 20×20  | 2.25        |
| lg    | 24×24  | 2.5         |

---

## Data Layer

Add `ICON_SIZES` constant to `assets/lucide-icons.ts`:

```ts
export const ICON_SIZES = [
  { label: 'sm', size: 16, strokeWidth: 2    },
  { label: 'md', size: 20, strokeWidth: 2.25 },
  { label: 'lg', size: 24, strokeWidth: 2.5  },
] as const;
```

`IconEntry` type is unchanged — sizes are universal across all icons.

---

## `LucideIconCard` Preview Area

Replace the single centered icon with a flex row of three icon columns.

Each column layout:
```
   [icon]
    16
   sw:2
```

- Icon sized via `style={{ width: size, height: size }}` for pixel-exact rendering
- `strokeWidth` passed directly as prop
- Each column: `flex flex-col items-center gap-1`
- Size label (e.g. `16`): `text-[10px] text-zinc-400` (light bg) / `text-zinc-500` (dark bg)
- Stroke label (e.g. `sw:2`): same size, one step more muted
- Light/dark toggle applies to the whole preview area (unchanged)

Footer (icon name + copy button + tags) is unchanged.

---

## No Changes to `IconsPage`

The page layout (`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4`) is unchanged — the card handles the size display internally.
