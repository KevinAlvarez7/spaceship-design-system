# ThinkingShip Fixes + ThinkingLogo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix invisible dome/belly and faint asteroids on ThinkingShip, then add a new `ThinkingLogo` component (using SpaceshipLogoScene at 20×24px) as a third `icon="logo"` option on the `Thinking` component.

**Architecture:** All changes live in `components/ui/thinking.tsx` (shape constants + new component), `styles/tokens.css` (asteroid token opacity), `components/ui/index.ts` (barrel export), and `app/components/[component]/ThinkingPage.tsx` (viewer docs). `ThinkingLogo` wraps `SpaceshipLogoScene` from `components/effects/SpaceshipLogo/` — a cross-directory import that is allowed (only `components/viewer/` and `components/shadcn/` are off-limits to DS components).

**Tech Stack:** Next.js 16, Tailwind v4, TypeScript, CVA, motion/react, SpaceshipLogoScene (effects layer).

---

### Task 1: Fix asteroid token opacity

The asteroid color token uses `color-mix(… 40%, transparent)` AND the animation applies per-element opacity 0→1 on top of it — double-fading to near-invisible. Remove the color-mix so the per-element opacity animation is the sole fade control.

**Files:**
- Modify: `styles/tokens.css` (lines ~246–258 light theme, ~326–338 dark theme)

**Step 1: Update both token declarations**

Find the two blocks (light `:root` and dark `[data-theme="dark"]`) and change:

```css
/* Light theme — was: color-mix(in srgb, var(--neutral-400) 40%, transparent) */
--effect-thinking-asteroid: var(--neutral-400);

/* Dark theme — was: color-mix(in srgb, var(--neutral-500) 40%, transparent) */
--effect-thinking-asteroid: var(--neutral-500);
```

**Step 2: Build to verify**

```bash
npm run build
```
Expected: compiles with zero errors.

**Step 3: Commit**

```bash
git add styles/tokens.css
git commit -m "fix(tokens): remove double-fade from asteroid token — opacity animation is sole fade control"
```

---

### Task 2: Fix ThinkingShip dome and belly visibility

The dome/belly arc heights (`DOME_H_MIN=0.6`, `BELLY_H_MIN=0.6`) render at ~0.5–0.7px at sm size — sub-pixel, invisible. Raise all four constants.

**Files:**
- Modify: `components/ui/thinking.tsx` (lines ~406–415, the "Ship shape — tilt-animatable geometry" block)

**Step 1: Update the four constants**

```ts
// Ship shape — tilt-animatable geometry
const BODY_RX      = 8;    // constant half-width (fills ~80% of viewBox after rotation)
const BODY_RY_MIN  = 1.5;  // side-on profile (neutral)
const BODY_RY_MAX  = 3.5;  // full disc surface visible at max tilt
const DOME_R       = 3;    // dome arc half-span
const DOME_H_MIN   = 1.5;  // dome bump at neutral — must be ≥1.2 to be visible at 16px
const DOME_H_MAX   = 3.5;  // dome height when facing toward viewer
const BELLY_R      = 3;    // belly arc half-span
const BELLY_H_MIN  = 1.2;  // belly bump at neutral
const BELLY_H_MAX  = 3.5;  // belly height when facing away from viewer
```

**Step 2: Clearance sanity check (mental)**

Worst case: body ry=3.5, dome height=3.5. Peak dome at (0, -7.0) in ship-local space. After −45° rotation: (−7×0.707, −7×0.707) ≈ (−4.95, −4.95) offset from ship center at (10, 10). Translated: (5.05, 5.05) — well inside the 0–20 viewBox. ✓

**Step 3: Build**

```bash
npm run build
```
Expected: zero errors.

**Step 4: Commit**

```bash
git add components/ui/thinking.tsx
git commit -m "fix(thinking-ship): raise dome/belly min heights to be visible at 16px render size"
```

---

### Task 3: Add ThinkingLogo component

New `ThinkingLogo` component in `thinking.tsx` that wraps `SpaceshipLogoScene` at `width=20`, `interactive=false`, `decorations=[]` (no planets, no stars). Fixed 20×24px container.

**Files:**
- Modify: `components/ui/thinking.tsx` — add import + new component block after ThinkingShip section

**Step 1: Add the import at the top of the file**

`SpaceshipLogoScene` lives in `components/effects/SpaceshipLogo/SpaceshipLogoScene.tsx`. Add it to the existing imports at the top of `thinking.tsx`:

```ts
import { SpaceshipLogoScene } from '@/components/effects/SpaceshipLogo/SpaceshipLogoScene';
```

**Step 2: Add the ThinkingLogo block after the ThinkingShip section (after line ~590)**

Place this immediately after the closing `}` of `ThinkingShip`:

```tsx
// ━━━ ThinkingLogo — SpaceshipLogoScene at 20×24 px ━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingLogoProps {
  disableMotion?: boolean;
  className?:     string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/** SpaceshipLogoScene (saucer + beam sweep) rendered at 20×24 px as a thinking indicator. */
export function ThinkingLogo({ disableMotion = false, className }: ThinkingLogoProps) {
  return (
    <span className={cn('inline-flex items-center justify-center w-5 h-6 overflow-hidden', className)}>
      <SpaceshipLogoScene
        width={20}
        interactive={false}
        disableMotion={disableMotion}
        decorations={[]}
      />
    </span>
  );
}
```

**Step 3: Build**

```bash
npm run build
```
Expected: zero errors.

---

### Task 4: Export ThinkingLogo from barrel + wire into Thinking component

**Files:**
- Modify: `components/ui/index.ts`
- Modify: `components/ui/thinking.tsx` — Thinking component `icon` prop and render switch

**Step 1: Add export to barrel**

Open `components/ui/index.ts` and find the `ThinkingShip` export line. Add `ThinkingLogo` alongside it:

```ts
export { ThinkingLogo, type ThinkingLogoProps } from './thinking';
```

**Step 2: Update Thinking component `icon` prop type**

In `thinking.tsx`, find the `ThinkingProps` interface (around line 696). Change:

```ts
icon?: 'dots' | 'spaceship';
```

to:

```ts
icon?: 'dots' | 'spaceship' | 'logo';
```

**Step 3: Update the iconEl render switch**

Find the `iconEl` assignment (around line 726):

```ts
const iconEl = icon === 'spaceship'
  ? <ThinkingShip size="sm" disableMotion={disableMotion} />
  : <ThinkingDots size="sm" pattern="radial" variant={shimmerVariant === 'subtle' ? 'subtle' : 'rainbow'} disableMotion={disableMotion} />;
```

Replace with:

```ts
const iconEl = icon === 'logo'
  ? <ThinkingLogo disableMotion={disableMotion} />
  : icon === 'spaceship'
  ? <ThinkingShip size="sm" disableMotion={disableMotion} />
  : <ThinkingDots size="sm" pattern="radial" variant={shimmerVariant === 'subtle' ? 'subtle' : 'rainbow'} disableMotion={disableMotion} />;
```

**Step 4: Build**

```bash
npm run build
```
Expected: zero errors.

**Step 5: Commit**

```bash
git add components/ui/thinking.tsx components/ui/index.ts
git commit -m "feat(thinking): add ThinkingLogo component — SpaceshipLogoScene at 20×24px, icon=\"logo\""
```

---

### Task 5: Update viewer page

**Files:**
- Modify: `app/components/[component]/ThinkingPage.tsx`

**Step 1: Update the `icon` prop row description**

Find the `PROPS` array, the `icon` row. Change:

```ts
{ name: 'icon', type: '"dots" | "spaceship"', default: '"dots"', description: 'Icon shown before the label. dots = 3×3 gravity grid. spaceship = mini saucer weaving through asteroid streaks.' },
```

to:

```ts
{ name: 'icon', type: '"dots" | "spaceship" | "logo"', default: '"dots"', description: 'Icon shown before the label. dots = 3×3 gravity grid. spaceship = mini saucer weaving through asteroid streaks. logo = full SpaceshipLogoScene (saucer + beam sweep) at 20×24 px.' },
```

**Step 2: Add Logo Icon section to the page**

In the JSX, after the closing `</section>` of the "Spaceship Icon" section and before the "Static" section, insert:

```tsx
{/* Logo Icon */}
<section>
  <h2 className="text-base font-semibold text-zinc-800 mb-3">Logo Icon</h2>
  <p className="text-sm text-zinc-500 mb-4">
    The full SpaceshipLogoScene artwork — saucer + animated beam sweep — rendered at 20&times;24&thinsp;px
    as a thinking indicator. Use <code>icon=&quot;logo&quot;</code> to activate.
  </p>
  <div className="space-y-4">
    <Preview justify="start" label='icon="logo" — saucer + beam sweep'>
      <Thinking icon="logo" />
    </Preview>
    <Preview justify="start" label='icon="logo" + textScramble'>
      <Thinking icon="logo" textScramble />
    </Preview>
    <Preview justify="start" label='icon="logo" + disableMotion — static saucer'>
      <Thinking icon="logo" disableMotion />
    </Preview>
  </div>
</section>
```

**Step 3: Update USAGE code block**

In the `USAGE` string, after the existing `icon="spaceship"` examples, add:

```ts
// Logo icon — full SpaceshipLogoScene saucer + beam
<Thinking icon="logo" />
<Thinking icon="logo" textScramble />
```

**Step 4: Build**

```bash
npm run build
```
Expected: zero errors, all 46 static pages generated.

**Step 5: Commit**

```bash
git add app/components/[component]/ThinkingPage.tsx
git commit -m "docs(thinking): add logo icon section to viewer page"
```

---

## Verification Checklist

After all tasks complete:

1. `npm run build` — zero TypeScript/build errors
2. `npm run lint` — no new warnings
3. Visual check at `/components/thinking` in dev server (`npm run dev`):
   - ThinkingShip sm/md/lg: dome and belly clearly visible at all sizes; swells during weave
   - Asteroid streaks clearly visible as diagonal lines (not ghostly)
   - `icon="logo"` shows saucer with animated beam sweep at 20×24px
   - `icon="logo" disableMotion` shows static saucer, no beam animation
4. Token audit — no new hardcoded hex values introduced
