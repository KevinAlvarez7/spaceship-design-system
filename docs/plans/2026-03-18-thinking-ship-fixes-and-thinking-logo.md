# Design: ThinkingShip fixes + ThinkingLogo new icon

**Date:** 2026-03-18
**Status:** Approved

---

## Context

Three issues with the current `thinking.tsx` ThinkingShip animation, plus a new icon variant request.

---

## 1. ThinkingShip — dome/belly invisible

**Root cause:** `DOME_H_MIN=0.6` / `BELLY_H_MIN=0.6` are sub-pixel at 16–24px render sizes (0.5–0.7px). The arcs exist but can't be seen.

**Fix:** Raise minimums and maximums for dome and belly height constants:

| Constant | Before | After |
|---|---|---|
| DOME_H_MIN | 0.6 | 1.5 |
| DOME_H_MAX | 2.0 | 3.5 |
| BELLY_H_MIN | 0.6 | 1.2 |
| BELLY_H_MAX | 2.0 | 3.5 |

At size-sm (16px): 1.5 viewBox units = 1.2px — visible. At size-lg (24px): 1.5 units = 1.8px — clearly visible. The max values give a rich dome at peak tilt. Clearance verified: all shapes stay within the 0–20 viewBox at worst-case wave + tilt.

---

## 2. Asteroids — visibility

**Root cause:** Token `--effect-thinking-asteroid` is `color-mix(…neutral-400 40%, transparent)`. The animation then _also_ applies per-element opacity 0→1, double-fading each streak to near-invisible.

**Fix:** Remove the `color-mix` transparency from the token. Use the plain neutral color so the per-element opacity animation is the sole fade control:

```css
/* light */
--effect-thinking-asteroid: var(--neutral-400);
/* dark */
--effect-thinking-asteroid: var(--neutral-500);
```

---

## 3. New ThinkingLogo component (icon="logo")

A third thinking icon option that uses the actual SpaceshipLogoScene artwork — the full saucer with animated beam sweep — at a fixed 20×24px size.

**Component:** `ThinkingLogo` in `components/ui/thinking.tsx`

- Wraps `SpaceshipLogoScene` from `components/effects/SpaceshipLogo/`
- Props: `width=20`, `interactive=false`, `decorations=[]` (no planets, no stars)
- At `width=20`: SpaceshipLogoScene totalH ≈ 23px (fits in 24px container)
- The beam sweep animation is the primary motion
- Container: `inline-flex items-center justify-center` with fixed `w-5 h-6` (20×24px)
- Props: `disableMotion?`, `className?` — no size variants (fixed size)

**Integration:**
- `ThinkingLogo` exported from `components/ui/index.ts`
- `Thinking` component's `icon` prop extended: `'dots' | 'spaceship' | 'logo'`
- When `icon='logo'`: renders `<ThinkingLogo disableMotion={disableMotion} />`

**Viewer page updates:**
- New section "Logo Icon" in ThinkingPage.tsx showing `icon="logo"` examples
- Props table description for `icon` updated to include `"logo"`
- Usage code block updated

---

## Files to change

1. `styles/tokens.css` — asteroid token (light + dark)
2. `components/ui/thinking.tsx` — DOME_H_MIN/MAX, BELLY_H_MIN/MAX, new ThinkingLogo component, Thinking prop type
3. `components/ui/index.ts` — export ThinkingLogo
4. `app/components/[component]/ThinkingPage.tsx` — new Logo Icon section, updated props/usage
