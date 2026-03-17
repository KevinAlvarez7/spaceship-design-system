"use client";

import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Variant definitions ──────────────────────────────────────────────────────
// v2: simplified — scale-only motion (no radial fill), 3 variants, rounded-full pill shape

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-sans [font-weight:var(--font-weight-semibold)]',
    'transition-colors duration-(--duration-base) ease-(--ease-in-out)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-(--border-input-focus)',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
    'rounded-full', // pill shape — differs from v1
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-(--bg-interactive-primary-default) text-(--text-inverse)',
          'hover:bg-(--bg-interactive-primary-hover)',
          'active:bg-(--bg-interactive-primary-pressed)',
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
        sm: [
          'py-2 px-4 gap-1',
          '[font-size:var(--font-size-sm)] leading-(--line-height-sm)',
        ],
        md: [
          'py-3 px-5 gap-2',
          '[font-size:var(--font-size-sm)] leading-(--line-height-sm)',
        ],
      },
      surface: {
        default: '',
        shadow:  'shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow duration-(--duration-base) ease-(--ease-in-out)',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
      surface: 'default',
    },
  }
);

type SizeKey = NonNullable<VariantProps<typeof buttonVariants>['size']>;

const ICON_CLASSES: Record<SizeKey, string> = {
  sm: '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:2.75]',
  md: '[&>svg]:h-5 [&>svg]:w-5 [&>svg]:[stroke-width:3]',
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
  extends HTMLMotionProps<'button'>,
    VariantProps<typeof buttonVariants> {
  disableMotion?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  className,
  variant,
  size,
  surface,
  disableMotion = false,
  disabled,
  leadingIcon,
  trailingIcon,
  children,
  ...props
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

  if (disableMotion || disabled) {
    return (
      <button
        className={classes}
        disabled={disabled}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }

  return (
    <motion.button
      {...props}
      className={classes}
      style={{ ...props.style, willChange: 'transform' }}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={springs.interactive}
    >
      {content}
    </motion.button>
  );
}
