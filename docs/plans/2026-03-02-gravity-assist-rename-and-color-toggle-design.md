# Design: GravityAssist alias + color mode toggle

**Date:** 2026-03-02

## Problem

Two unrelated improvements to the Gravity Well effect:
1. The component should be exportable under the name `GravityAssist` (a "launch pad" metaphor) while preserving the existing `GravityWell` export for backward compatibility.
2. The viewer page hardcodes the rainbow gradient. A toggle between neutral (zinc) and rainbow (brand colors) is needed so both modes are demoed side-by-side.

---

## Part 1: GravityAssist barrel alias

### Decision

Add re-export aliases in `components/effects/index.ts`. The source file `GravityWell.tsx` is not touched. Both names resolve to the same implementation.

```ts
// New lines in index.ts
export { GravityWell as GravityAssist } from './GravityWell/GravityWell';
export type { GravityWellProps as GravityAssistProps } from './GravityWell/GravityWell';
```

No wrapper file. No duplication. Existing imports of `GravityWell` / `GravityWellProps` continue to work.

---

## Part 2: Viewer rename (display + route)

The viewer page adopts the "Gravity Assist" name throughout. The underlying component file is unchanged.

| Location | Before | After |
|---|---|---|
| File | `GravityWellPage.tsx` | `GravityAssistPage.tsx` |
| Page component | `GravityWellPage` | `GravityAssistPage` |
| Route key in `page.tsx` | `'gravity-well'` | `'gravity-assist'` |
| Topbar title | `Effects / Gravity Well` | `Effects / Gravity Assist` |
| Sidebar label | `Gravity Well` | `Gravity Assist` |
| Sidebar href | `/effects/gravity-well` | `/effects/gravity-assist` |
| Page `<h1>` | `Gravity Well` | `Gravity Assist` |
| Import in `GravityAssistPage` | `GravityWell` | `GravityAssist` |

The old route `/effects/gravity-well` is a dev-only viewer URL — no redirect needed.

---

## Part 3: Color mode toggle

### Types

```ts
type ColorMode = 'neutral' | 'rainbow';
```

### State

`colorMode` (`ColorMode`, default `'rainbow'`) lives in both `GravityAssistPage` and `FullScreenModal`. Each owns its own copy — independent toggle state per view.

### ColorModeToggle component

Same pill-group pattern as the existing `ModeToggle`:

```tsx
function ColorModeToggle({
  colorMode,
  onChange,
}: {
  colorMode: ColorMode;
  onChange: (m: ColorMode) => void;
}) {
  return (
    <div className="flex gap-0.5 bg-zinc-100 rounded-md p-0.5 text-xs">
      {(['neutral', 'rainbow'] as ColorMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={
            colorMode === m
              ? 'bg-white text-zinc-900 shadow-sm rounded px-3 py-1 capitalize'
              : 'text-zinc-500 hover:text-zinc-700 px-3 py-1 capitalize'
          }
        >
          {m}
        </button>
      ))}
    </div>
  );
}
```

### Placement

Rendered in its own row **above** the preview canvas, inside the Preview section — between the `<h2>Preview</h2>` heading and the `<PreviewArea>`.

```tsx
<section>
  <h2 className="text-base font-semibold text-zinc-800 mb-3">Preview</h2>
  <div className="flex items-center gap-3 mb-3">
    <ColorModeToggle colorMode={colorMode} onChange={setColorMode} />
  </div>
  <PreviewArea colorMode={colorMode} ... />
  <div className="flex items-center gap-3 mt-3">
    <ModeToggle ... />
    <button>Open Full Screen</button>
  </div>
</section>
```

### PreviewArea

`PreviewAreaProps` gains `colorMode: ColorMode`. Inside `PreviewArea`, `lineColors` is derived:

```tsx
lineColors={colorMode === 'rainbow' ? BRAND_COLORS : []}
```

### FullScreenModal

`ColorModeToggle` is rendered in the overlay controls row (alongside the existing sliders and `ModeToggle`). Modal has its own `colorMode` state (default `'rainbow'`).

---

## Files changed

| File | Change |
|---|---|
| `components/effects/index.ts` | Add `GravityAssist` + `GravityAssistProps` re-exports |
| `app/effects/[effect]/GravityWellPage.tsx` | Rename to `GravityAssistPage.tsx`; rename component; use `GravityAssist`; add `ColorMode` type + `ColorModeToggle` + `colorMode` state; update `PreviewAreaProps` |
| `app/effects/[effect]/page.tsx` | Update route key, title, import |
| `components/viewer/Sidebar.tsx` | Update label + href |

---

## Out of scope

- Changes to `GravityWell.tsx` source
- Any redirect from the old `/effects/gravity-well` route
- Props table / USAGE example updates (separate concern)
