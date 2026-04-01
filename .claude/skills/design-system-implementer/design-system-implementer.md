---
name: design-system-implementer
description: >
  Use this skill for engineering implementation of design systems in code — whether
  a system is already documented or needs to be inferred from the existing codebase.
  Triggers when the user wants to: build token architecture in CSS, create CVA
  components, wire Tailwind to design tokens, apply a design system to a real feature,
  add a component that follows the system, refactor inconsistent styles into tokens,
  or set up dark mode via CSS variables. Also triggers for: "implement our design
  system", "build this component using our system", "wire up our tokens", "refactor
  this to use the design system", "set up tokens.css", "add dark mode", "create a
  CVA variant", or any task that turns design decisions into working code.
---

# Design System Implementer

This skill turns design decisions into working code. Whether those decisions live
in a documented design system, a Figma file, a Markdown spec, or only loosely in
the codebase itself — this skill handles the engineering execution.

The job is always the same: establish a token chain, build components that enforce
it, and use the system correctly in real features. What changes is where you start.

---

## Step 0 — Understand What Already Exists

Before writing a line of code, read the project. This prevents building parallel
systems alongside what already exists.

**If a documented design system exists** (MD files, Notion, Figma spec):
- Read it. Understand the token names, the component contracts, the naming conventions.
- Your job is to implement those decisions faithfully in code.

**If tokens exist in code** (tokens.css, design-tokens.json, CSS variables in globals):
- Read those files first. Use the names that already exist — don't introduce new ones.
- Audit for missing layers (often the semantic layer is missing, only primitives exist).

**If nothing is documented but a codebase exists**:
- Look at what's there: scan for repeated colors, font sizes, spacing values.
- Extract the implicit system — what values does the project already use consistently?
- Build tokens from what exists rather than imposing a foreign palette.

**If it's truly greenfield**:
- Establish the token foundation first before building any component.
- Start with the semantic layer — what roles does this product need? — then fill in primitives.

Ask if you're unsure which situation you're in.

---

## The Token Foundation

Every implementation starts here. Tokens are CSS custom properties organized in
three tiers. The chain is what makes theming, dark mode, and rebranding possible
without touching component files.

```
Primitive  →  Semantic  →  Component (optional)
(raw value)   (named role)   (component-specific override)

--blue-500  →  --color-action-primary  →  --button-primary-bg
#3b82f6        var(--blue-500)             var(--color-action-primary)
```

**Why this structure?**
When a component uses `--color-action-primary` and dark mode overrides that
token, the component updates automatically. If it used `#3b82f6` directly,
dark mode can't reach it. The alias chain is the mechanism that makes a system
actually systematic.

### Implementing tokens.css

Adapt the names, values, and categories to what the project actually needs.
These are examples — the structure and discipline matter, not the specific values.

```css
/* tokens.css */
:root {
  /* ── Primitives ────────────────────────────────────────────
     Raw values. Never reference these directly in components.
     ────────────────────────────────────────────────────────── */
  --orbit-blue-500:  #3b82f6;
  --orbit-blue-600:  #2563eb;
  --neutral-50:      #fafaf9;
  --neutral-900:     #18181b;
  --red-500:         #ef4444;

  /* ── Semantic: Color ────────────────────────────────────────
     Named roles. These are what components use.
     Pattern: --[category]-[role]-[modifier]-[state]
     ────────────────────────────────────────────────────────── */
  --bg-interactive-primary-default:  var(--orbit-blue-500);
  --bg-interactive-primary-hover:    var(--orbit-blue-600);
  --bg-surface-primary:              var(--neutral-50);
  --text-primary:                    var(--neutral-900);
  --text-secondary:                  #6b7280;
  --text-inverse:                    #ffffff;
  --border-default:                  rgba(0, 0, 0, 0.08);
  --border-input-default:            rgba(0, 0, 0, 0.12);
  --border-input-focus:              var(--orbit-blue-500);
  --bg-interactive-error-default:    var(--red-500);

  /* ── Semantic: Typography ───────────────────────────────────
     Font decisions made once, used everywhere.
     Font family: replace with project's actual font.
     ────────────────────────────────────────────────────────── */
  --font-family-base: 'Inter', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 0.9375rem;
  --text-lg:   1.125rem;
  --text-xl:   1.375rem;
  --text-2xl:  1.75rem;
  --text-3xl:  2.25rem;

  --font-regular:  400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  --leading-tight:   1.25;
  --leading-normal:  1.5;
  --leading-relaxed: 1.75;

  /* ── Semantic: Spacing ──────────────────────────────────────
     Base-4 scale. Named by value — avoids "what is 'large'?"
     ────────────────────────────────────────────────────────── */
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* ── Semantic: Shape ────────────────────────────────────────*/
  --radius-sm:   0.25rem;
  --radius-md:   0.5rem;
  --radius-lg:   0.75rem;
  --radius-xl:   1rem;
  --radius-full: 9999px;

  /* ── Semantic: Elevation ────────────────────────────────────
     Layered shadows — avoids the harsh single-shadow look.
     ────────────────────────────────────────────────────────── */
  --shadow-sm:
    0px 0px 0px 1px rgba(0,0,0,0.06),
    0px 1px 2px -1px rgba(0,0,0,0.06),
    0px 2px 4px rgba(0,0,0,0.04);
  --shadow-md:
    0px 0px 0px 1px rgba(0,0,0,0.08),
    0px 2px 4px -1px rgba(0,0,0,0.08),
    0px 4px 8px rgba(0,0,0,0.06);
  --shadow-lg:
    0px 0px 0px 1px rgba(0,0,0,0.08),
    0px 4px 8px -2px rgba(0,0,0,0.12),
    0px 12px 24px rgba(0,0,0,0.08);
}

/* ── Dark Mode ──────────────────────────────────────────────────
   Override semantic tokens only. Primitives never change.
   Components need zero modifications — they inherit through the chain.
   Selector: [data-theme="dark"] on <html> (NOT .dark class).
   ───────────────────────────────────────────────────────────────── */
[data-theme="dark"] {
  --bg-surface-primary:    var(--neutral-900);
  --text-primary:          #fafaf9;
  --text-secondary:        #a1a1aa;
  --border-default:        rgba(255,255,255,0.08);
  --shadow-sm:
    0px 0px 0px 1px rgba(255,255,255,0.06),
    0px 1px 2px -1px rgba(0,0,0,0.4),
    0px 2px 4px rgba(0,0,0,0.3);
}
```

---

## Wiring Tailwind to Tokens

The goal is to use Tailwind utilities that resolve to your CSS custom properties,
not Tailwind's defaults. This keeps the token chain intact.

### Tailwind v4 — @theme in globals.css

In Tailwind v4 the `@theme` block in `globals.css` maps CSS custom properties to
Tailwind utilities. Components then reference tokens via the **paren syntax**:
`bg-(--token-name)` — NOT the v3 bracket syntax `bg-[var(--token-name)]`.

```css
/* globals.css */
@import "tailwindcss";
@import "./tokens.css";

@theme {
  /* Expose tokens as Tailwind utilities */
  --color-bg-interactive-primary-default: var(--bg-interactive-primary-default);
  --color-bg-surface-primary:             var(--bg-surface-primary);
  --color-text-primary:                   var(--text-primary);
  --color-border-default:                 var(--border-default);

  --radius-sm:   var(--radius-sm);
  --radius-md:   var(--radius-md);
  --radius-lg:   var(--radius-lg);
  --radius-full: var(--radius-full);

  --font-sans: var(--font-family-base);
  --font-mono: var(--font-family-mono);
}
```

**Paren syntax usage:**

```tsx
// ✅ Tailwind v4 — paren syntax (this project)
className="bg-(--bg-interactive-primary-default) text-(--text-primary)"

// ❌ Tailwind v3 bracket syntax — do NOT use
className="bg-[var(--bg-interactive-primary-default)] text-[var(--text-primary)]"
```

---

## Building Components

Components enforce the token contract at the point of use. CVA (class-variance-authority)
is the mechanism — it separates structural classes (never change) from variant classes
(always token-based).

```ts
// lib/utils.ts — always needed
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// components/ui/button.tsx — full v4 pattern with all conventions
"use client";

import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base: array syntax, structural and behavioural only — no colours, no token values
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-sans [font-weight:var(--font-weight-semibold)]',
    'transition-colors duration-(--duration-base) ease-(--ease-in-out)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-(--border-input-focus)',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        // Paren syntax — never hardcoded hex, never Tailwind colour utilities
        primary: [
          'bg-(--bg-interactive-primary-default) text-(--text-inverse)',
          'hover:bg-(--bg-interactive-primary-hover)',
          'active:bg-(--bg-interactive-primary-pressed)',
        ],
        secondary: [
          'bg-(--bg-interactive-secondary-default) text-(--text-primary)',
          'hover:bg-(--bg-interactive-secondary-hover)',
        ],
        ghost: [
          'text-(--text-primary)',
          'hover:bg-(--bg-interactive-secondary-default)',
        ],
        destructive: [
          'bg-(--bg-interactive-error-default) text-(--text-inverse)',
          'hover:bg-(--bg-interactive-error-hover)',
        ],
      },
      size: {
        sm: ['py-(--spacing-4xs) px-(--spacing-3xs) gap-(--spacing-5xs)',
             '[font-size:var(--font-size-sm)] leading-(--line-height-sm) rounded-(--radius-md)'],
        md: ['py-(--spacing-3xs) px-(--spacing-2xs) gap-(--spacing-4xs)',
             '[font-size:var(--font-size-sm)] leading-(--line-height-sm) rounded-(--radius-md)'],
        'icon-sm': 'h-[2.25rem] w-[2.25rem] p-0 rounded-(--radius-md)',
        icon:      'h-(--spacing-xl) w-(--spacing-xl) p-0 rounded-(--radius-md)',
      },
      // surface variant: how the component appears on different backgrounds
      surface: {
        default: '',
        shadow:  'shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow duration-(--duration-base) ease-(--ease-in-out) rounded-(--radius-xl)',
      },
    },
    // compoundVariants: handle multi-axis logic (surface × variant / surface × state)
    // Add here when border/shadow switching depends on both axes at once.
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
      surface: 'default',
    },
  }
);

type SurfaceKey = NonNullable<VariantProps<typeof buttonVariants>['surface']>;
type SizeKey = NonNullable<VariantProps<typeof buttonVariants>['size']>;

// SCALE and SPRING_TRANSITION power the motion pattern
const SCALE: Record<SurfaceKey, { hover: number; tap: number }> = {
  default: { hover: 1.03, tap: 0.97 },
  shadow:  { hover: 1.02, tap: 0.98 },
};
const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 400, damping: 17 };

// Icon pattern: ICON_CLASSES record maps each size to svg dimensions
const ICON_CLASSES: Record<SizeKey, string> = {
  sm:        '[&>svg]:h-(--spacing-2xs) [&>svg]:w-(--spacing-2xs)',
  md:        '[&>svg]:h-(--spacing-xs)  [&>svg]:w-(--spacing-xs)',
  'icon-sm': '[&>svg]:h-(--spacing-xs)  [&>svg]:w-(--spacing-xs)',
  icon:      '[&>svg]:h-(--spacing-sm)  [&>svg]:w-(--spacing-sm)',
};

function IconSlot({ icon, sizeKey }: { icon: ReactNode; sizeKey: SizeKey }) {
  if (!icon) return null;
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', ICON_CLASSES[sizeKey])}>
      {icon}
    </span>
  );
}

export interface ButtonProps
  extends HTMLMotionProps<'button'>,        // motion/react for animation
    VariantProps<typeof buttonVariants> {
  disableMotion?: boolean;                  // opt out of animation
  leadingIcon?: ReactNode;                  // icon before label
  trailingIcon?: ReactNode;                 // icon after label
}

export function Button({
  className, variant, size, surface,
  disableMotion = false, disabled,
  leadingIcon, trailingIcon, children, ...props
}: ButtonProps) {
  const sizeKey: SizeKey = size ?? 'sm';
  const classes = cn(buttonVariants({ variant, size, surface }), className);
  const content = (
    <>
      <IconSlot icon={leadingIcon} sizeKey={sizeKey} />
      {children}
      <IconSlot icon={trailingIcon} sizeKey={sizeKey} />
    </>
  );

  // Motion pattern: use plain <button> when motion is disabled or component is disabled
  if (disableMotion || disabled) {
    return (
      <button className={classes} disabled={disabled}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {content}
      </button>
    );
  }

  const surfaceKey: SurfaceKey = surface ?? 'default';
  const scale = SCALE[surfaceKey];
  return (
    <motion.button className={classes}
      whileHover={{ scale: scale.hover }}
      whileTap={{ scale: scale.tap }}
      transition={SPRING_TRANSITION}
      {...props}>
      {content}
    </motion.button>
  );
}

export { buttonVariants };
```

### Component rules

- **Base classes**: use **array syntax** — pass `[...]` to `cva()`, not a string
- **Variant classes**: paren syntax only — `bg-(--token-name)`, never v3 bracket syntax (`bg-[var(--name)]`) or Tailwind colour utilities (`bg-blue-500`)
- **`surface` variant**: every component must have one — `default` / `shadow-border` at minimum
- **`compoundVariants`**: required when border/shadow logic depends on two axes simultaneously (e.g., `state × surface`)
- **Motion pattern**: wrap in `motion/react`; accept `disableMotion` prop; fall back to plain HTML element
- **Icon pattern**: `leadingIcon`/`trailingIcon` props + `ICON_CLASSES` record + `IconSlot` helper
- **`className` always last via `cn()`** — the escape hatch for one-off overrides
- **Named exports only** — no default exports (cleaner refactoring, better tree-shaking)
- **Export the variants function** — engineers compose with it directly

---

## Project Structure

Adapt to what the project already has. What matters is the separation, not the names.

```
src/
├── styles/
│   ├── tokens.css        ← CSS custom properties (the source of truth)
│   └── globals.css       ← Tailwind base + token wiring
├── lib/
│   └── utils.ts          ← cn() helper
└── components/
    ├── ui/               ← primitive components: no business logic, no data fetching
    │   ├── button.tsx
    │   ├── input.tsx
    │   ├── card.tsx
    │   └── index.ts      ← barrel: all imports go through here
    └── patterns/         ← compositions of ui/ + layout, no data fetching
        ├── pricing-card.tsx
        └── index.ts
```

The barrel (`index.ts`) is what makes imports stable. When a file moves, only the
barrel updates — not every file that imports it.

```ts
// components/ui/index.ts
export { Button, buttonVariants } from './button';
export type { ButtonProps }       from './button';
export { Input }                  from './input';
export { Card, CardHeader, CardContent } from './card';
```

---

## Applying the System in Real Features

The most common failure mode: a system exists but isn't used. New features get
built with one-off styles that bypass the token chain entirely.

**When building a real page or feature:**

Use existing components — never reimplement them:
```tsx
// ✅ Use the system
import { Button, Card } from '@/components/ui';

// ❌ Never recreate what already exists
<button className="bg-blue-500 px-4 py-2 rounded">...</button>
```

Apply tokens directly to one-off elements — use **paren syntax**:
```tsx
// Layout, sections, headings that aren't full components
<section className="bg-(--bg-surface-primary) py-(--spacing-xl)">
  <h1 className="[font-size:var(--font-size-2xl)] [font-weight:var(--font-weight-bold)] text-(--text-primary)">
```

Never use dark: variants inside component or feature code:
```tsx
// ❌ Component knows about themes — breaks the model
className="bg-white dark:bg-zinc-900"

// ✅ Token handles it — component stays ignorant of themes
className="bg-(--bg-surface-primary)"
```

---

## When No System Is Documented Yet

If there's a codebase but no documented design system, extract the implicit one:

1. **Scan for recurring values** — What colors appear more than twice? What font
   sizes? What spacing values? These are your de facto tokens.

2. **Name by role, not value** — Don't token `#3b82f6` as `--blue`. Token it as
   `--color-action-primary` based on where it's used.

3. **Start with what's most broken** — Usually: colors hardcoded everywhere, no
   dark mode path, spacing inconsistent. Fix the highest-leverage problem first.

4. **Don't refactor everything at once** — Introduce `tokens.css`, then migrate
   new components to use it. Let old components migrate gradually. A partial system
   that's used is better than a complete one that's ignored.

---

## Anti-Patterns

```tsx
// ❌ Hardcoded hex — theme can't reach it
className="bg-[#3b82f6]"
// ✅ Token reference (paren syntax)
className="bg-(--bg-interactive-primary-default)"

// ❌ Tailwind colour utility — bypasses token chain
className="text-white bg-zinc-900 border-gray-200"
// ✅ Semantic token only
className="text-(--text-inverse) bg-(--bg-surface-primary) border-(--border-default)"

// ❌ Primitive token in component — wrong layer
className="bg-(--orbit-blue-500)"
// ✅ Semantic token — let tokens.css handle the alias
className="bg-(--bg-interactive-primary-default)"

// ❌ Tailwind v3 bracket syntax — wrong version
className="bg-[var(--bg-interactive-primary-default)]"
// ✅ Tailwind v4 paren syntax
className="bg-(--bg-interactive-primary-default)"

// ❌ Inline style for token values
style={{ color: '#292524' }}
// ✅ Token in className
className="text-(--text-primary)"

// ❌ Dark mode in component
className="bg-white dark:bg-zinc-900"
// ✅ Semantic token handles it
className="bg-(--bg-surface-primary)"

// ❌ Missing surface variant — component can't adapt to different backgrounds
const cardVariants = cva('...', { variants: { variant: { ... } } });
// ✅ surface variant always present
const cardVariants = cva('...', { variants: { variant: { ... }, surface: { default: '', 'shadow-border': '...' } } });

// ❌ Importing directly from file
import { Button } from '@/components/ui/button';
// ✅ Always through the barrel
import { Button } from '@/components/ui';

// ❌ Business logic in ui/
// A button that imports useAuthStore — wrong layer
// ✅ ui/ components are pure. Logic lives in pages or patterns.

// ❌ Pattern using raw HTML instead of DS components
// components/patterns/my-form.tsx
<button className="bg-(--bg-interactive-primary-default) ...">Submit</button>
// ✅ Pattern composes from DS components
import { Button } from '@/components/ui';
<Button variant="primary">Submit</Button>
```

---

## Pattern Rules

Patterns (`components/patterns/`) compose DS components — they are **not** DS components themselves.

- **Import exclusively from `@/components/ui`** — never recreate a DS component inside a pattern
- **Tokens for layout only** — gap, padding, flex/grid structure may use paren-syntax token refs
- **No inline `style={{ ... }}`** with hardcoded values
- **No Tailwind colour utilities** — `text-zinc-*`, `bg-white`, `border-gray-*`, etc. are forbidden
- **No direct HTML where a DS component exists** — if `<Button>` exists, use it

---

## After Creating or Modifying a DS Component

When a component is created or has new variants added, create or update its story:

1. Check if `stories/ui/{ComponentName}.stories.tsx` exists.
2. If not, use the `/add-story` skill to generate it.
3. If it exists and new variants were added, add corresponding named story exports.
4. Run `npx storybook build` to verify the story compiles cleanly.

---

## Reference Files

Read when needed:
- `references/component-templates.md` — Full templates: Input, Card, Badge, Select, Textarea
