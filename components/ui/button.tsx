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
        sm: 'h-8 px-3 [font-size:var(--font-size-sm)] leading-[var(--line-height-sm)] rounded-[var(--radius-md)]',
        md: 'h-10 px-4 [font-size:var(--font-size-sm)] leading-[var(--line-height-sm)] rounded-[var(--radius-md)]',
        lg: 'h-12 px-6 [font-size:var(--font-size-base)] leading-[var(--line-height-base)] rounded-[var(--radius-lg)]',
      },
      surface: {
        default:         '',
        'neo-brutalist': 'border-2 border-[var(--border-default)] shadow-[var(--shadow-neo-brutalist)] rounded-[var(--radius-sm)]',
        professional:    'shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] transition-shadow rounded-[var(--radius-xl)]',
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
  default:         { hover: 1.03, tap: 0.97 },
  'neo-brutalist': { hover: 1.04, tap: 0.96 },
  professional:    { hover: 1.02, tap: 0.98 },
};

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 400, damping: 17 };

export interface ButtonProps
  extends HTMLMotionProps<'button'>,
    VariantProps<typeof buttonVariants> {
  disableMotion?: boolean;
  children?: React.ReactNode;
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
