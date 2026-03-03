---
name: shadow-border
description: >
  Use this skill whenever applying the shadow-border technique — using layered
  box-shadows instead of CSS borders to create depth-aware, background-adaptive
  boundaries. Triggers when the user says "shadow border", "shadow instead of
  border", "depth border", or asks for a subtle border effect that adapts to
  different backgrounds. Also triggers when working with cards, modals, images,
  or interactive elements that need a border with more visual depth.
---

# Shadow-Border Skill

This skill implements the shadow-border technique: using layered `box-shadow`
values instead of a `border` property to create boundaries that carry depth,
adapt to any background color, and handle transparent/image backgrounds gracefully.

The core insight is that borders are **opaque** and **flat** — they don't respond
to what's behind them. Shadows are **transparent** and **dimensional** — they
build depth instead of just framing.

---

## Why Shadow Instead of Border?

| Concern | Border | Shadow-Border |
|---|---|---|
| Works on image backgrounds | ✗ Solid color shows | ✓ Transparent, adapts |
| Works on gradient backgrounds | ✗ Clashes | ✓ Blends naturally |
| Conveys depth | ✗ Flat | ✓ Layered elevation |
| Hover transitions | ✗ Jumps | ✓ Smooth via `transition` |
| Dark/light mode | Needs two values | Single alpha value works both |

---

## The Core Shadow Stack

The shadow-border uses **three layers** working together:

```css
.shadow-border {
  box-shadow:
    /* Layer 1: The "border" — a tight, spread-only ring */
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    /* Layer 2: Directional lift — slight upward emphasis */
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    /* Layer 3: Ambient fill — wide, soft base shadow */
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);
}
```

**Layer anatomy:**
- **Layer 1** (`0px 0px 0px 1px`) — zero offset, zero blur, 1px spread. This IS the border. Alpha at 6% keeps it perceptible but not harsh.
- **Layer 2** (`0px 1px 2px -1px`) — subtle directional shadow that implies the element lifts slightly off the surface.
- **Layer 3** (`0px 2px 4px 0px`) — the ambient base. Fills in the illusion of elevation without competing with the border ring.

---

## Hover State

Increase all opacities slightly — same structure, more presence:

```css
.shadow-border:hover {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 1px 2px -1px rgba(0, 0, 0, 0.08),
    0px 2px 4px 0px rgba(0, 0, 0, 0.06);
}
```

**Rule:** Hover = base alpha + ~2% on each layer. Don't change offsets or spread — only opacity.

---

## Transition

Always transition `box-shadow` alongside colors for a smooth hover:

```css
.shadow-border {
  transition-property: color, background-color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

In Tailwind, use: `transition-[colors,box-shadow]` or `transition-shadow`

---

## Implementation Patterns

### Vanilla CSS

```css
/* Default */
.shadow-border {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);
  transition: box-shadow 150ms ease;
}

/* Hover */
.shadow-border:hover {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 1px 2px -1px rgba(0, 0, 0, 0.08),
    0px 2px 4px 0px rgba(0, 0, 0, 0.06);
}
```

### CSS Custom Properties (Recommended for Theming)

```css
:root {
  --shadow-border: 
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);

  --shadow-border-hover:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 1px 2px -1px rgba(0, 0, 0, 0.08),
    0px 2px 4px 0px rgba(0, 0, 0, 0.06);
}

.shadow-border {
  box-shadow: var(--shadow-border);
  transition: box-shadow 150ms ease;
}

.shadow-border:hover {
  box-shadow: var(--shadow-border-hover);
}
```

### Tailwind CSS (Custom Plugin / Config)

In `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        border: [
          '0px 0px 0px 1px rgba(0,0,0,0.06)',
          '0px 1px 2px -1px rgba(0,0,0,0.06)',
          '0px 2px 4px 0px rgba(0,0,0,0.04)',
        ].join(', '),
        'border-hover': [
          '0px 0px 0px 1px rgba(0,0,0,0.08)',
          '0px 1px 2px -1px rgba(0,0,0,0.08)',
          '0px 2px 4px 0px rgba(0,0,0,0.06)',
        ].join(', '),
      },
    },
  },
}
```

Usage: `class="shadow-border hover:shadow-border-hover transition-shadow"`

### Tailwind CSS (Arbitrary Values, No Config Change)

```html
<div class="
  shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]
  hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.06)]
  transition-shadow
">
```

---

## Elevation Scale (Optional Extension)

If the project uses multiple elevation tiers, build a consistent scale:

```css
/* Flush — border only, no lift */
--shadow-border-flat:
  0px 0px 0px 1px rgba(0, 0, 0, 0.06);

/* Default — subtle lift */
--shadow-border:
  0px 0px 0px 1px rgba(0, 0, 0, 0.06),
  0px 1px 2px -1px rgba(0, 0, 0, 0.06),
  0px 2px 4px 0px rgba(0, 0, 0, 0.04);

/* Raised — more prominent elevation (modal, dropdown) */
--shadow-border-raised:
  0px 0px 0px 1px rgba(0, 0, 0, 0.08),
  0px 4px 6px -2px rgba(0, 0, 0, 0.05),
  0px 8px 12px 0px rgba(0, 0, 0, 0.06);

/* Floating — max elevation (tooltip, popover) */
--shadow-border-floating:
  0px 0px 0px 1px rgba(0, 0, 0, 0.08),
  0px 8px 16px -4px rgba(0, 0, 0, 0.08),
  0px 16px 24px 0px rgba(0, 0, 0, 0.06);
```

---

## Dark Mode

Because all layers use `rgba(0,0,0,...)`, they **disappear** on dark backgrounds
(black shadow on black = invisible). Flip to white-based shadows in dark mode:

```css
:root {
  --shadow-border:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);
}

.dark {
  --shadow-border:
    0px 0px 0px 1px rgba(255, 255, 255, 0.08),
    0px 1px 2px -1px rgba(255, 255, 255, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.20);
}
```

**Dark mode rationale:** Layer 1 becomes a subtle white ring (the "border"). Layers 2–3 stay dark-toned since shadows cast downward still read against dark surfaces when more opaque.

---

## When NOT to Use This Technique

- **High-contrast / accessibility-first UIs** — the subtle alpha values may fail WCAG contrast checks for border visibility. Use an explicit `border` with sufficient contrast instead, or combine both.
- **Focus rings** — always use `outline` (not `box-shadow`) for keyboard focus states to avoid conflicts.
- **Print stylesheets** — `box-shadow` doesn't print reliably in all browsers.

---

## Checklist Before Shipping

- [ ] No hardcoded `border` competing with the shadow-border on the same element
- [ ] Transition includes `box-shadow` (not just `colors`)
- [ ] Hover state increases alpha only — offsets/spread unchanged
- [ ] Dark mode variant defined if theming is required
- [ ] Focus state uses `outline`, not `box-shadow`, to avoid conflict
- [ ] Tested on image and gradient backgrounds to verify transparency behavior
