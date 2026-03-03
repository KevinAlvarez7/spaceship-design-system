# Design System Viewer — Design Doc

**Date:** 2026-03-01
**Status:** Approved
**Purpose:** Reusable scaffold for any personal design system. Spin up this viewer in a new repo whenever you start a new design system — the chrome is stable, only the tokens and components change.

---

## Context

A living style guide / component explorer where design tokens, typography specimens, components, and patterns can be viewed and iterated on in one place. Built to be reused across projects — the viewer chrome is intentionally decoupled from the design system tokens it displays.

---

## Stack

- **Framework:** Next.js 15, App Router
- **Styling:** Tailwind CSS v4 (viewer chrome) + CSS custom properties (design system tokens)
- **Language:** TypeScript
- **Component variants:** class-variance-authority (CVA)
- **Viewer UI:** Shadcn UI + plain Tailwind (no DS tokens)
- **Code highlighting:** Shiki

---

## Key Architectural Decision: Viewer/DS Separation

The viewer chrome (sidebar, topbar, tables, code blocks) uses **plain Tailwind defaults + Shadcn UI** — no design system CSS custom properties. DS tokens only ever appear inside `<Preview>` wrappers.

**Why:** Token iteration is experimental. When a token changes, only the preview area updates — never the viewer shell. This keeps the tool stable during active design system development.

```
Viewer chrome (Tailwind + Shadcn)
└── <Preview> ← boundary
    └── DS components (CVA + CSS custom properties)
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  ← root layout: sidebar + topbar shell
│   ├── page.tsx                    ← redirect → /tokens/colors
│   ├── tokens/
│   │   └── [category]/
│   │       └── page.tsx            ← /tokens/colors, /tokens/typography, etc.
│   ├── typography/
│   │   └── page.tsx
│   ├── components/
│   │   ├── page.tsx
│   │   └── [component]/
│   │       └── page.tsx            ← /components/button, /components/input, etc.
│   └── patterns/
│       └── page.tsx
├── components/
│   ├── ui/                         ← THE DESIGN SYSTEM (CVA + CSS vars)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── index.ts                ← barrel export
│   ├── viewer/                     ← VIEWER CHROME (Tailwind + Shadcn only)
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── Preview.tsx
│   │   ├── TokenSwatch.tsx
│   │   ├── CodeBlock.tsx
│   │   └── PropsTable.tsx
│   └── patterns/                   ← DS pattern compositions
│       └── index.ts
├── styles/
│   ├── tokens.css                  ← CSS custom properties (source of truth)
│   └── globals.css                 ← @import tailwindcss + @theme wiring
├── lib/
│   └── utils.ts                    ← cn() helper
└── tokens/                         ← TypeScript mirrors of tokens.css (for viewer iteration)
    ├── colors.ts
    ├── typography.ts
    ├── spacing.ts
    ├── radius.ts
    ├── shadow.ts
    ├── motion.ts
    └── index.ts
```

---

## Routes

| Route | Content |
|-------|---------|
| `/` | Redirect → `/tokens/colors` |
| `/tokens/colors` | Color primitives + semantic swatches |
| `/tokens/typography` | Typography scale table |
| `/tokens/spacing` | Spacing scale |
| `/tokens/radius` | Radius scale |
| `/tokens/shadow` | Shadow/elevation |
| `/tokens/motion` | Duration + easing |
| `/typography` | Live type specimens (heading, body, label, caption, mono) |
| `/components/[component]` | Variants grid + props table + code snippet |
| `/patterns` | Pattern compositions |

---

## Token System

**Three-tier chain:**
```
Primitive → Semantic → Component (optional)
--blue-500 → --color-action-primary → --button-primary-bg
```

**Dark mode:** `[data-theme="dark"]` on `<html>`. Toggle in Topbar. Preference stored in `localStorage`. Only semantic tokens are overridden in dark mode — primitives never change.

**Naming convention:**
```
--color-action-primary
--color-surface-base
--color-text-muted
--space-4
--radius-md
--shadow-lg
--duration-base
--ease-out
```

**Token categories:**

| File | CSS tokens |
|------|-----------|
| `tokens/colors.ts` | Primitives + semantic (action, surface, text, border, feedback) |
| `tokens/typography.ts` | Font families, size scale (xs→3xl), weight, line-height, letter-spacing |
| `tokens/spacing.ts` | Base-4 scale: space-1 through space-16 |
| `tokens/radius.ts` | sm, md, lg, xl, full |
| `tokens/shadow.ts` | sm, md, lg (layered shadows) |
| `tokens/motion.ts` | Duration (fast/base/slow) + easing (ease-in, ease-out, ease-spring) |

**Tailwind v4 wiring** via `@theme` in `globals.css`:
```css
@import "tailwindcss";
@import "./tokens.css";

@theme {
  --color-primary:  var(--color-action-primary);
  --color-surface:  var(--color-surface-base);
  /* etc. */
}
```

---

## Viewer Shell

**Layout:** Two-column. Fixed sidebar (240px), scrollable main. Topbar sticky within main content area only.

**Sidebar nav:**
```
[Logo] Spaceship DS

Foundations
  Colors · Typography · Spacing · Radius · Shadow · Motion

Typography

Components
  Button · Input · Card · Badge · ...

Patterns
  Forms · Cards · ...
```

**Topbar:** DS preview theme toggle (light/dark). Labelled "Preview theme:" — this only affects what's inside `<Preview>` wrappers, not the viewer shell itself.

**`<Preview>` wrapper:**
- Dot-grid CSS background pattern
- Surface selector: white / subtle / dark (changes the preview background only)
- DS components render inside — they pick up DS tokens
- Viewer chrome never enters this boundary

---

## Initial DS Components (components/ui/)

| Component | Variants |
|-----------|----------|
| `Button` | variant: primary, secondary, outline, ghost, destructive × size: sm, md, lg |
| `Input` | size: sm, md, lg × state: default, error |
| `Card` | + CardHeader, CardContent, CardFooter sub-components |
| `Badge` | variant: default, primary, secondary, destructive, outline |

All use CVA. All reference CSS custom properties only — never hardcoded hex values.

## Initial Viewer Components (components/viewer/)

| Component | Purpose |
|-----------|---------|
| `Sidebar` | Nav tree, active link state, collapsible section groups |
| `Topbar` | DS theme toggle (light/dark) |
| `Preview` | Isolation wrapper, dot-grid bg, surface selector |
| `TokenSwatch` | Color chip + CSS var name + hex value |
| `CodeBlock` | Shiki syntax-highlighted snippet with copy button |
| `PropsTable` | Prop / type / default / description table |

---

## Workflow: Adding New DS Tokens from Figma

1. Paste Figma variable output
2. Map to CSS custom properties in `styles/tokens.css` (slash → hyphen, prefix `--`)
3. Mirror in the relevant `tokens/*.ts` file so the viewer can iterate over them
4. Semantic tokens update automatically in all DS components and `<Preview>` wrappers

---

## Decisions Log

### 2026-03-01 — Viewer uses Tailwind defaults, not DS tokens

**Decision:** The viewer chrome (sidebar, topbar, tables) uses plain Tailwind + Shadcn UI. DS tokens only appear inside `<Preview>` wrappers.
**Reason:** Active token iteration would constantly break the viewer shell if it used DS tokens. Stable viewer = faster iteration on the actual system.
**Alternatives considered:** Viewer uses DS tokens (elegant but unstable during iteration), viewer uses separate `--viewer-*` namespace (two token systems in one repo, unnecessary complexity).

### 2026-03-01 — Tailwind v4 with @theme

**Decision:** Tailwind v4, CSS-first config via `@theme` in `globals.css`. No `tailwind.config.ts`.
**Reason:** Greenfield project, v4 is current. CSS-first keeps all token definitions in one place.

### 2026-03-01 — Three-tier token chain

**Decision:** Primitives → Semantic → Component (optional).
**Reason:** Semantic layer means dark mode and rebranding only require updating aliases — DS components need zero changes.
**Alternatives considered:** Primitives only (rejected — primitive references in components break on rebrand).
