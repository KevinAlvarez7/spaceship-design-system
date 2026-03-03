# Gravity Chat Playground — Design

**Date:** 2026-03-02
**Status:** Approved

---

## Overview

A playground page that composes `ChatInputBox` and `GravityWell` into a single interactive scene. The GravityWell canvas fills the full viewport as a background. The ChatInputBox is a persistent gravity attractor. A hidden easter egg — a circle logo above the input — lets users detach a "black hole cursor" that roams the canvas as a second gravity source.

---

## Page Location

`app/patterns/gravity-chat/page.tsx`

Sidebar nav entry added under Patterns.

---

## State Machine

```
        enter circle logo
idle ─────────────────────────────→ blackHole
  ↑                                     │
  └─────── cursor enters input box ─────┘
```

### States

| State | Gravity sources | Circle logo | Cursor |
|---|---|---|---|
| `idle` | Input box center (static) | 40px, visible | System default |
| `blackHole` | Input box center + mouse position | Gone (became cursor) | Hidden; custom black hole circle follows mouse |

---

## Component Tree

```
GravityChatPlayground (page component)
├── container div (full viewport, position: relative)
│   ├── GravityWell (canvas, position: absolute inset-0)
│   ├── CircleLogo (Framer Motion div, positioned above ChatInputBox)
│   ├── BlackHoleCursor (Framer Motion div, position: fixed, pointer-events: none)
│   └── ChatInputBox (centered bottom, z-index above canvas)
```

---

## Gravity Source Wiring

Uses `sourcesRef` (zero-rerender ref) — the GravityWell RAF loop reads it directly on every tick. No React re-renders on mouse move.

| State | `sourcesRef.current` |
|---|---|
| `idle` | `[{ x: inputCx, y: inputCy, mass: 6 }]` |
| `blackHole` | `[{ x: inputCx, y: inputCy, mass: 6 }, { x: mouseX, y: mouseY, mass: 10 }]` |

**Physics parameters (both sources):**
- `softness: 150` — wide, gradual field; no sharp warp
- `radius: 150` (GravityWell default)

Mouse position is written to a plain ref on `mousemove` — zero React re-renders.

---

## Animations

### Circle logo

| Trigger | Scale | Opacity | Spring |
|---|---|---|---|
| `idle` | `1` (40px) | `1` | — |
| Hover | `0.6` | `1` | `{ stiffness: 400, damping: 28 }` |
| `blackHole` (exit) | `0` | `0` | `{ stiffness: 400, damping: 28 }` |
| Reset (re-entry) | `0 → 1` | `0 → 1` | `{ stiffness: 260, damping: 20 }` (bouncier) |

### Black hole cursor

- `useMotionValue` for x/y, set directly on `mousemove` (no re-renders)
- `useSpring` on x/y for magnetic lag: `{ stiffness: 500, damping: 35 }`
- Renders as ~16px dark circle with radial gradient glow
- `pointer-events: none` — does not block canvas mouse events
- Visible only in `blackHole` state

---

## Interaction Details

### Entering black hole mode
- User hovers the 40px circle logo
- Circle constricts (scale 0.6 on hover) then collapses (scale 0, opacity 0)
- State switches to `blackHole`
- Container gets `cursor: none`
- BlackHoleCursor element appears and begins following the mouse

### Roaming the canvas
- `mousemove` on the container writes `{ x, y }` to a mouse ref
- On each RAF tick, GravityWell reads `sourcesRef.current` — now two sources
- The black hole cursor's spring-driven position provides slight lag

### Resetting
- `onMouseEnter` on the ChatInputBox wrapper
- State returns to `idle`
- Container cursor restored
- BlackHoleCursor disappears
- Circle logo springs back in with bounce spring

---

## Out of Scope

- ChatInputBox submit wired to gravity events
- Mobile touch support for black hole mode (GravityWell touch already handled natively)
- Persisted state between visits
