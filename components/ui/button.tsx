"use client";

import { motion, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-sans (font-weight:--font-weight-semibold) transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-(--border-input-focus)',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-(--bg-interactive-primary-default) text-(--text-inverse)',
          'hover:bg-(--bg-interactive-primary-hover)',
          'active:bg-(--bg-interactive-primary-pressed)',
        ],
        secondary: [
          'bg-(--bg-interactive-secondary-default) text-(--text-primary)',
          'hover:bg-(--bg-interactive-secondary-hover)',
        ],
        outline: [
          'bg-(--bg-interactive-secondary-default) text-(--text-interactive-primary)',
          'hover:bg-(--bg-interactive-primary-default) hover:text-(--text-inverse)',
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
        sm: 'h-8 px-3 (font-size:--font-size-sm) leading-(--line-height-sm) rounded-(--radius-md)',
        md: 'h-10 px-4 (font-size:--font-size-sm) leading-(--line-height-sm) rounded-(--radius-md)',
        lg: 'h-12 px-6 (font-size:--font-size-base) leading-(--line-height-base) rounded-(--radius-lg)',
      },
      surface: {
        default:         '',
        'neo-brutalist': 'border-2 border-(--border-default) shadow-(--shadow-neo-brutalist) rounded-(--radius-sm)',
        professional:    'shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow rounded-(--radius-xl)',
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
