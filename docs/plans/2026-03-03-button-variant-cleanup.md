# Button Variant & Surface Cleanup — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove `outline` variant and `neo-brutalist` surface, rename `professional` → `shadow`, and add a `success` variant.

**Architecture:** All changes are isolated to two files: `components/ui/button.tsx` (CVA definitions + SCALE config) and `app/components/[component]/ButtonPage.tsx` (viewer page). No token changes are needed — `--bg-interactive-success-*` tokens already exist in `styles/tokens.css`. No barrel or motion config changes required.

**Tech Stack:** CVA (`class-variance-authority`), `motion/react`, Tailwind v4 CSS custom properties.

---

## Files to Change

| File | Change |
|------|--------|
| `components/ui/button.tsx` | Remove `outline` variant, remove `neo-brutalist` surface, rename `professional` → `shadow` in CVA + SCALE, add `success` variant |
| `app/components/[component]/ButtonPage.tsx` | Remove Outline + Neo-Brutalist sections, rename Professional → Shadow, add Success to Variants + Disabled, update Motion Effects, update props table + usage |

---

## Task 1: Update `components/ui/button.tsx`

**File:** `components/ui/button.tsx`

### Step 1: Replace the entire file

The complete replacement is below. Key changes vs current:
- `outline` variant removed from `variants.variant`
- `neo-brutalist` surface removed from `variants.surface`
- `professional` surface key renamed to `shadow`
- `success` variant added using `--bg-interactive-success-*` tokens
- `SCALE` updated: `neo-brutalist` entry removed, `professional` key renamed to `shadow`

```tsx
"use client";

import { motion, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-sans [font-weight:var(--font-weight-semibold)] transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--border-input-focus)]',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--bg-interactive-primary-default)] text-[var(--text-inverse)]',
          'hover:bg-[var(--bg-interactive-primary-hover)]',
          'active:bg-[var(--bg-interactive-primary-pressed)]',
        ],
        secondary: [
          'bg-[var(--bg-interactive-secondary-default)] text-[var(--text-primary)]',
          'hover:bg-[var(--bg-interactive-secondary-hover)]',
        ],
        ghost: [
          'text-[var(--text-primary)]',
          'hover:bg-[var(--bg-interactive-secondary-default)]',
        ],
        success: [
          'bg-[var(--bg-interactive-success-default)] text-[var(--text-inverse)]',
          'hover:bg-[var(--bg-interactive-success-hover)]',
          'active:bg-[var(--bg-interactive-success-pressed)]',
        ],
        destructive: [
          'bg-[var(--bg-interactive-error-default)] text-[var(--text-inverse)]',
          'hover:bg-[var(--bg-interactive-error-hover)]',
        ],
      },
      size: {
        sm: 'h-8 px-3 [font-size:var(--font-size-sm)] leading-[var(--line-height-sm)] rounded-[var(--radius-md)]',
        md: 'h-10 px-4 [font-size:var(--font-size-sm)] leading-[var(--line-height-sm)] rounded-[var(--radius-md)]',
        lg: 'h-12 px-6 [font-size:var(--font-size-base)] leading-[var(--line-height-base)] rounded-[var(--radius-lg)]',
      },
      surface: {
        default: '',
        shadow:  'shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] transition-shadow rounded-[var(--radius-xl)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      surface: 'default',
    },
  }
);

type SurfaceKey = NonNullable<VariantProps<typeof buttonVariants>['surface']>;

const SCALE: Record<SurfaceKey, { hover: number; tap: number }> = {
  default: { hover: 1.03, tap: 0.97 },
  shadow:  { hover: 1.02, tap: 0.98 },
};

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 400, damping: 17 };

export interface ButtonProps
  extends HTMLMotionProps<'button'>,
    VariantProps<typeof buttonVariants> {
  disableMotion?: boolean;
}

export function Button({
  className,
  variant,
  size,
  surface,
  disableMotion = false,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, surface }), className);

  if (disableMotion || disabled) {
    return (
      <button
        className={classes}
        disabled={disabled}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    );
  }

  const surfaceKey: SurfaceKey = surface ?? 'default';
  const scale = SCALE[surfaceKey];

  return (
    <motion.button
      className={classes}
      whileHover={{ scale: scale.hover }}
      whileTap={{ scale: scale.tap }}
      transition={SPRING_TRANSITION}
      {...props}
    />
  );
}

export { buttonVariants };
```

### Step 2: Verify TypeScript compiles

```bash
npx tsc --noEmit
```

Expected: no errors.

### Step 3: Commit

```bash
git add components/ui/button.tsx
git commit -m "feat(button): replace outline/neo-brutalist with success/shadow surface"
```

---

## Task 2: Update `app/components/[component]/ButtonPage.tsx`

**File:** `app/components/[component]/ButtonPage.tsx`

### Step 1: Replace the entire file

```tsx
import { Button }     from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'variant',       type: '"primary" | "secondary" | "ghost" | "success" | "destructive"', default: '"primary"', description: 'Visual style' },
  { name: 'size',          type: '"sm" | "md" | "lg"',     default: '"md"',   description: 'Height and padding scale' },
  { name: 'surface',       type: '"default" | "shadow"',   default: '"default"', description: 'Surface treatment: default (flat) or shadow (subtle shadow-border ring)' },
  { name: 'disabled',      type: 'boolean',                default: 'false',  description: 'Prevents interaction, reduces opacity. Also disables motion.' },
  { name: 'disableMotion', type: 'boolean',                default: 'false',  description: 'Opt out of spring hover/press animation. Renders a plain <button> with no motion overhead.' },
  { name: 'className',     type: 'string',                 default: '—',      description: 'Additional classes merged via cn()' },
];

const USAGE = `import { Button } from '@/components/ui';

<Button variant="primary" size="md">Get started</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="success">Confirm</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="primary" surface="shadow">Elevated</Button>

{/* Opt out of spring animation */}
<Button variant="primary" disableMotion>Submit</Button>`;

export function ButtonPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Button</h1>
        <p className="mt-2 text-sm text-zinc-500">Primary interactive element. Use for actions, not navigation. One primary per section maximum.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variants</h2>
        <Preview label="All variants">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="success">Success</Button>
          <Button variant="destructive">Destructive</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <Preview label="All sizes">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled</h2>
        <Preview label="Disabled state">
          <Button disabled>Primary</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="ghost"     disabled>Ghost</Button>
          <Button variant="success"   disabled>Success</Button>
          <Button variant="destructive" disabled>Destructive</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Shadow Surface</h2>
        <Preview label='surface="shadow"'>
          <Button variant="primary"   surface="shadow">Primary</Button>
          <Button variant="secondary" surface="shadow">Secondary</Button>
          <Button variant="ghost"     surface="shadow">Ghost</Button>
          <Button variant="success"   surface="shadow">Success</Button>
          <Button variant="destructive" surface="shadow">Destructive</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion Effects</h2>
        <p className="text-sm text-zinc-500 mb-3">Hover to scale up, click and hold to scale down. Spring physics tuned per surface.</p>
        <Preview label="default surface — hover: 1.03×, tap: 0.97×">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
        </Preview>
        <Preview label='shadow surface — hover: 1.02×, tap: 0.98× (restrained)'>
          <Button variant="primary"   surface="shadow">Primary</Button>
          <Button variant="secondary" surface="shadow">Secondary</Button>
          <Button variant="success"   surface="shadow">Success</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion Disabled</h2>
        <p className="text-sm text-zinc-500 mb-3">Use <code className="text-xs bg-zinc-100 px-1 rounded">disableMotion</code> to render a plain button with no animation overhead.</p>
        <Preview label="disableMotion — no spring animation">
          <Button variant="primary"   disableMotion>Primary</Button>
          <Button variant="secondary" disableMotion>Secondary</Button>
          <Button variant="ghost"     disableMotion>Ghost</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
```

### Step 2: Commit

```bash
git add "app/components/[component]/ButtonPage.tsx"
git commit -m "feat(button-page): update viewer for new variants and surfaces"
```

---

## Task 3: Verify build

### Step 1: Run build

```bash
npm run build
```

Expected: clean build, no TypeScript errors, `/components/button` route included in static pages output.

### Step 2: Spot-check lint on changed files

```bash
npx eslint components/ui/button.tsx "app/components/[component]/ButtonPage.tsx"
```

Expected: no output (zero errors).
