# Design: Experiment Badge System

**Date:** 2026-03-02

## Problem

The Gravity Well effect (and any future exploratory work) needs a clear, consistent signal that it is not production-ready — visible both in the sidebar navigation and on the page itself.

## Decision

Approach A: NavItem metadata flag.

## Architecture

### NavItem type extension

Add an optional `experiment?: true` field to the existing `NavItem` type in `Sidebar.tsx`. No other structural changes to the nav data shape.

```ts
type NavItem = {
  label: string;
  href?: string;
  experiment?: true;
  children?: NavItem[];
};
```

Gravity Well entry becomes:

```ts
{ label: 'Gravity Well', href: '/effects/gravity-well', experiment: true }
```

### Sidebar badge

`NavLink` checks `item.experiment` and appends a small inline chip after the label text. The chip uses plain Tailwind zinc palette (viewer chrome rules — no DS tokens outside `<Preview>`).

Visual: `Experiment` in an amber-tinted pill — amber conveys "in progress / caution" without alarming red.

### ExperimentBadge viewer component

A new `components/viewer/ExperimentBadge.tsx` named export. Renders a standalone chip intended for page headers — same amber style as the sidebar chip, slightly larger to suit h1-level context.

Usage on any page:

```tsx
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';

<div className="flex items-center gap-3">
  <h1 className="text-2xl font-bold text-zinc-900">Gravity Well</h1>
  <ExperimentBadge />
</div>
```

### GravityWellPage

The existing `<h1>` row in the page header is updated to include `<ExperimentBadge />` inline.

## Visual spec

| Location | Text | Style |
|----------|------|-------|
| Sidebar nav item | `Experiment` | `text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200` |
| Page header | `Experiment` | `text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200` |

## Files changed

| File | Change |
|------|--------|
| `components/viewer/Sidebar.tsx` | Add `experiment?: true` to `NavItem`, update `NavLink` to render chip, flag Gravity Well entry |
| `components/viewer/ExperimentBadge.tsx` | New file — named export `ExperimentBadge` |
| `app/effects/[effect]/GravityWellPage.tsx` | Import and render `<ExperimentBadge />` in page header |

## Out of scope

- Dismissible banners or tooltips
- Any routing or URL-convention-based detection
- Changes to DS components or `styles/tokens.css`
