# Button Typography Tokens + Surface Variants Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire full typography tokens into `Button` and replace the `surface` prop values with named intent variants (`default`, `neo-brutalist`, `professional`).

**Architecture:** Single file change to `components/ui/button.tsx`. Surface styling moves directly into the `surface` variant map — no compound variants needed since both new surface values apply the same class regardless of button `variant`. Old compound variants for `secondary+default` and `outline+default` borders are removed.

**Tech Stack:** CVA (`class-variance-authority`), Tailwind v4, CSS custom properties.

---

### Task 1: Add typography tokens to base and size variants

**Files:**
- Modify: `components/ui/button.tsx`

**Step 1: Open the file and locate the base classes array (lines 4–12)**

Current base array has `font-[var(--font-weight-semibold)]`. Add font-family next to it.

**Step 2: Add `font-[var(--font-family-secondary)]` to the base classes**

Change this line:
```ts
'font-[var(--font-weight-semibold)] transition-all',
```
To:
```ts
'font-[var(--font-family-secondary)] font-[var(--font-weight-semibold)] transition-all',
```

**Step 3: Add line-height tokens to the `size` variants**

Replace the entire `size` block:
```ts
size: {
  sm: 'h-8 px-3 text-[var(--font-size-sm)] rounded-[var(--radius-md)]',
  md: 'h-10 px-4 text-[var(--font-size-sm)] rounded-[var(--radius-md)]',
  lg: 'h-12 px-6 text-[var(--font-size-base)] rounded-[var(--radius-lg)]',
},
```
With:
```ts
size: {
  sm: 'h-8 px-3 text-[var(--font-size-sm)] leading-[var(--line-height-sm)] rounded-[var(--radius-md)]',
  md: 'h-10 px-4 text-[var(--font-size-sm)] leading-[var(--line-height-sm)] rounded-[var(--radius-md)]',
  lg: 'h-12 px-6 text-[var(--font-size-base)] leading-[var(--line-height-base)] rounded-[var(--radius-lg)]',
},
```

**Step 4: Verify build passes**

```bash
npm run build
```
Expected: no errors.

**Step 5: Commit**

```bash
git add components/ui/button.tsx
git commit -m "feat(button): wire font-family and line-height typography tokens"
```

---

### Task 2: Replace surface variants

**Files:**
- Modify: `components/ui/button.tsx`

**Step 1: Replace the `surface` variant map**

Remove the old `surface` block:
```ts
surface: {
  default:         '',
  'shadow-border': '',
},
```
Replace with:
```ts
surface: {
  default:          '',
  'neo-brutalist':  'border-2 border-[var(--border-default)]',
  professional:     'shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] transition-shadow',
},
```

**Step 2: Delete the entire `compoundVariants` array**

Remove this block completely (lines 48–71 in the original file):
```ts
compoundVariants: [
  // default surface — restore borders that belonged to each bordered variant
  {
    variant: 'secondary',
    surface: 'default',
    class: 'border border-[var(--border-default)] hover:border-[var(--border-subtle)]',
  },
  {
    variant: 'outline',
    surface: 'default',
    class: 'border border-[var(--border-input-focus)]',
  },
  // shadow-border surface — replace border with shadow ring
  {
    variant: 'secondary',
    surface: 'shadow-border',
    class: 'shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] transition-shadow',
  },
  {
    variant: 'outline',
    surface: 'shadow-border',
    class: 'shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] transition-shadow',
  },
],
```

No compound variants are needed: `neo-brutalist` and `professional` apply the same class to every button variant uniformly.

**Step 3: Verify the final shape of `button.tsx`**

The complete file should look like this:
```ts
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-[var(--font-family-secondary)] font-[var(--font-weight-semibold)] transition-all',
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
        outline: [
          'bg-[var(--bg-interactive-secondary-default)] text-[var(--text-interactive-primary)]',
          'hover:bg-[var(--bg-interactive-primary-default)] hover:text-[var(--text-inverse)]',
        ],
        ghost: [
          'text-[var(--text-primary)]',
          'hover:bg-[var(--bg-interactive-secondary-default)]',
        ],
        destructive: [
          'bg-[var(--bg-interactive-error-default)] text-[var(--text-inverse)]',
          'hover:bg-[var(--bg-interactive-error-hover)]',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-[var(--font-size-sm)] leading-[var(--line-height-sm)] rounded-[var(--radius-md)]',
        md: 'h-10 px-4 text-[var(--font-size-sm)] leading-[var(--line-height-sm)] rounded-[var(--radius-md)]',
        lg: 'h-12 px-6 text-[var(--font-size-base)] leading-[var(--line-height-base)] rounded-[var(--radius-lg)]',
      },
      surface: {
        default:         '',
        'neo-brutalist': 'border-2 border-[var(--border-default)]',
        professional:    'shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] transition-shadow',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      surface: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, surface, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, surface }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
```

**Step 4: Run lint and build**

```bash
npm run lint && npm run build
```
Expected: no errors or warnings.

**Step 5: Visual verification**

```bash
npm run dev
```
Navigate to `/components/button` in the viewer. Confirm:
- Buttons render with the correct font (Outfit / sans-serif)
- `surface="neo-brutalist"` shows a 2px solid black border on every variant
- `surface="professional"` shows a soft shadow ring on every variant
- `surface="default"` (primary, ghost, destructive) is flat — no border, no shadow

**Step 6: Commit**

```bash
git add components/ui/button.tsx
git commit -m "feat(button): replace surface variants with neo-brutalist and professional"
```
