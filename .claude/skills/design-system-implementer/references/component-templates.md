# Component Templates

Starter templates for common UI primitives. Each follows the CVA + CSS custom properties format from the main skill — **Tailwind v4 paren syntax**, actual project token names, `surface` variant, `compoundVariants`, and array base classes.

---

## Input

```tsx
// components/ui/input.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'w-full rounded-(--radius-md)',
    'bg-(--bg-input-default) px-3',
    'text-(--text-primary)',
    'placeholder:text-(--text-placeholder)',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-(--border-input-focus)',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-8  text-(--font-size-sm)',
        md: 'h-10 text-(--font-size-sm)',
        lg: 'h-12 text-(--font-size-base)',
      },
      state: {
        default: 'focus-visible:ring-(--border-input-focus)',
        error:   'focus-visible:ring-(--border-error)',
      },
      surface: {
        default:         'border',
        'shadow-border': 'shadow-(--shadow-border) focus-within:shadow-(--shadow-border-hover) transition-shadow',
      },
    },
    compoundVariants: [
      // default surface — add border colour per state
      { state: 'default', surface: 'default', class: 'border-(--border-input-default)' },
      { state: 'error',   surface: 'default', class: 'border-(--border-error)' },
    ],
    defaultVariants: {
      size:    'md',
      state:   'default',
      surface: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export function Input({ className, size, state, surface, ...props }: InputProps) {
  return (
    <input
      className={cn(inputVariants({ size, state, surface }), className)}
      {...props}
    />
  );
}

export { inputVariants };
```

---

## Card

```tsx
// components/ui/card.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  ['rounded-(--radius-lg)'],
  {
    variants: {
      surface: {
        default:         'bg-(--bg-surface-primary)',
        'shadow-border': 'bg-(--bg-surface-primary)',
        elevated:        'bg-(--bg-surface-primary)',
      },
    },
    compoundVariants: [
      // default surface — standard border
      { surface: 'default',         class: 'border border-(--border-default)' },
      // shadow-border surface — shadow ring instead of border
      { surface: 'shadow-border',   class: 'shadow-(--shadow-border)' },
      // elevated surface — drop shadow
      { surface: 'elevated',        class: 'shadow-(--shadow-md)' },
    ],
    defaultVariants: {
      surface: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, surface, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ surface }), className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

export { cardVariants };
```

---

## Badge

```tsx
// components/ui/badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-(--radius-full) px-2.5 py-0.5 text-(--font-size-xs) [font-weight:var(--font-weight-semibold)] transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-(--bg-interactive-secondary-default) text-(--text-secondary)',
        primary:     'bg-(--bg-interactive-primary-default) text-(--text-inverse)',
        secondary:   'bg-(--bg-surface-primary) text-(--text-secondary)',
        destructive: 'bg-(--bg-interactive-error-default) text-(--text-inverse)',
        outline:     'text-(--text-interactive-primary)',
      },
      surface: {
        default:         '',
        'shadow-border': '',
      },
    },
    compoundVariants: [
      // default surface — restore borders for bordered variants
      { variant: 'default',   surface: 'default',       class: 'border border-(--border-default)' },
      { variant: 'secondary', surface: 'default',       class: 'border border-(--border-default)' },
      { variant: 'outline',   surface: 'default',       class: 'border border-(--border-input-focus)' },
      // shadow-border surface — replace border with shadow ring
      { variant: 'default',   surface: 'shadow-border', class: 'shadow-(--shadow-border)' },
      { variant: 'secondary', surface: 'shadow-border', class: 'shadow-(--shadow-border)' },
      { variant: 'outline',   surface: 'shadow-border', class: 'shadow-(--shadow-border)' },
    ],
    defaultVariants: {
      variant: 'default',
      surface: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, surface, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, surface }), className)} {...props} />;
}

export { badgeVariants };
```

---

## Select

```tsx
// components/ui/select.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const selectVariants = cva(
  [
    'w-full appearance-none rounded-(--radius-md)',
    'bg-(--bg-input-default) px-3 py-2 pr-8',
    'text-(--font-size-sm) text-(--text-primary)',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-(--border-input-focus)',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      surface: {
        default:         'border border-(--border-input-default)',
        'shadow-border': 'shadow-(--shadow-border) focus-within:shadow-(--shadow-border-hover) transition-shadow',
      },
    },
    defaultVariants: {
      surface: 'default',
    },
  }
);

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {}

export function Select({ className, surface, children, ...props }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        className={cn(selectVariants({ surface }), className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-secondary)" />
    </div>
  );
}
```

---

## Textarea

```tsx
// components/ui/textarea.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  [
    'w-full min-h-[80px] rounded-(--radius-md)',
    'bg-(--bg-input-default) px-3 py-2',
    'text-(--font-size-sm) text-(--text-primary)',
    'placeholder:text-(--text-placeholder)',
    'transition-colors resize-y',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-(--border-input-focus)',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      surface: {
        default:         'border border-(--border-input-default)',
        'shadow-border': 'shadow-(--shadow-border) focus-within:shadow-(--shadow-border-hover) transition-shadow',
      },
    },
    defaultVariants: {
      surface: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

export function Textarea({ className, surface, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(textareaVariants({ surface }), className)}
      {...props}
    />
  );
}

export { textareaVariants };
```
