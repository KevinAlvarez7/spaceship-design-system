# Assets Section — Design Doc

**Date:** 2026-03-03
**Status:** Approved

---

## Overview

Add an "Assets" section to the design system viewer to house Logo, Icon, Illustration, and Animation assets. Assets are stored in-repo, cataloged via a typed manifest, and displayed with preview, copy, download, and metadata actions.

---

## Architecture

### Routing

Mirrors the existing `app/components/[component]/` pattern exactly.

```
app/assets/[category]/
  page.tsx              ← dynamic route, dispatches to category components
  LogoPage.tsx
  IconsPage.tsx
  IllustrationsPage.tsx
  AnimationsPage.tsx
```

### Manifest

Single source of truth for all assets. Same role as `tokens/*.ts`.

```
assets/
  index.ts
```

### Static files

Served by Next.js from `public/`:

```
public/assets/
  logo/
  icons/
  illustrations/
  animations/
```

### New viewer components

Viewer chrome only — Tailwind zinc palette, no DS tokens.

```
components/viewer/
  AssetCard.tsx         ← preview + copy / download / metadata actions
  AssetGrid.tsx         ← responsive grid wrapper
  AnimationPlayer.tsx   ← conditionally renders Lottie / Rive / SVG / CSS
```

### Sidebar

New "Assets" collapsible section with four links:
- Logo → `/assets/logo`
- Icons → `/assets/icons`
- Illustrations → `/assets/illustrations`
- Animations → `/assets/animations`

---

## Manifest & Asset Model

```typescript
export type AssetFormat =
  | 'svg'
  | 'png'
  | 'jpg'
  | 'lottie'    // .json played by dotlottie-web
  | 'rive'      // .riv played by @rive-app/react-canvas
  | 'svg-anim'; // inline SVG with CSS / SMIL animation

export type AssetEntry = {
  name: string;
  filePath: string;        // relative to /public, e.g. '/assets/icons/arrow.svg'
  format: AssetFormat;
  description?: string;
  tags?: string[];
  dimensions?: { width: number; height: number };
};

export type AssetCategory = {
  title: string;
  assets: AssetEntry[];
};

export const ASSETS: Record<string, AssetCategory> = {
  logo:          { title: 'Logo',          assets: [] },
  icons:         { title: 'Icons',         assets: [] },
  illustrations: { title: 'Illustrations', assets: [] },
  animations:    { title: 'Animations',    assets: [] },
};
```

Adding a new asset = one entry in the relevant category array. No viewer code changes required.

**Copy action behavior by format:**
- `svg` / `svg-anim` → copy raw SVG markup
- `lottie` / `rive` → copy import path
- `png` / `jpg` → copy public URL

---

## Viewer UX

### AssetCard layout

```
┌─────────────────────────────┐
│                             │
│       [preview area]        │  ← click to toggle light / dark bg
│                             │
├─────────────────────────────┤
│  Name              [↓][</>] │  ← download + copy buttons
│  description text           │
│  [tag] [tag]                │
└─────────────────────────────┘
```

- Preview background toggles light/dark on click for contrast checking
- Download triggers a direct file download
- Tags render as small chips

### AssetGrid

Responsive CSS grid of `AssetCard` components. Consistent card size across all categories.

### AnimationPlayer

Dynamic imports keep the bundle lean — players only load when the manifest contains that format.

| Format | Player | Load strategy |
|--------|--------|---------------|
| `svg-anim` | Native `<img>` or inline `<svg>` | Static |
| `lottie` | `@lottiefiles/dotlottie-web` | `next/dynamic` |
| `rive` | `@rive-app/react-canvas` | `next/dynamic(..., { ssr: false })` |
| `css` | Inline `<div>` | Static |

### Category page pattern

Each page is a thin wrapper over the manifest slice:

```tsx
import { ASSETS } from '@/assets';
import { AssetGrid } from '@/components/viewer/AssetGrid';

export function IconsPage() {
  return <AssetGrid assets={ASSETS.icons.assets} />;
}
```

---

## Dependencies

Optional — install only when adding that animation type:

| Package | When needed |
|---------|-------------|
| `@lottiefiles/dotlottie-web` | Any Lottie asset in manifest |
| `@rive-app/react-canvas` | Any Rive asset in manifest |

`AnimationPlayer` renders a "player not installed" fallback if the import fails, so the viewer never breaks.

---

## Edge Cases

- **Empty category** — dashed-border placeholder: "No assets yet. Add files to `public/assets/{category}/` and register them in `assets/index.ts`."
- **Rive SSR** — loaded with `next/dynamic(..., { ssr: false })` to avoid canvas errors
- **Unknown category slug** — `notFound()` same as component router
- **Raster assets** — plain `<img>` tag; copy-SVG action not shown

---

## Deferred (YAGNI)

- Search / filter by tag — add when the library is large enough
- Figma sync script — extend `scripts/generate-tokens.mjs` to export icons later
