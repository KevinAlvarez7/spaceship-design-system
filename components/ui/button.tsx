"use client";

import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
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
        success: [
          'bg-(--bg-interactive-success-default) text-(--text-inverse)',
          'hover:bg-(--bg-interactive-success-hover)',
          'active:bg-(--bg-interactive-success-pressed)',
        ],
        destructive: [
          'bg-(--bg-interactive-error-default) text-(--text-inverse)',
          'hover:bg-(--bg-interactive-error-hover)',
        ],
      },
      size: {
        sm: [
          'py-(--spacing-4xs) px-(--spacing-3xs) gap-(--spacing-5xs)',
          '[font-size:var(--font-size-sm)] leading-(--line-height-sm) rounded-(--radius-md)',
        ],
        md: [
          'py-(--spacing-3xs) px-(--spacing-2xs) gap-(--spacing-4xs)',
          '[font-size:var(--font-size-sm)] leading-(--line-height-sm) rounded-(--radius-md)',
        ],
        'icon-sm': 'h-[2.25rem] w-[2.25rem] p-0 rounded-(--radius-md)',
        icon:      'h-(--spacing-xl) w-(--spacing-xl) p-0 rounded-(--radius-md)',
      },
      surface: {
        default: '',
        shadow:  'shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow duration-(--duration-base) ease-(--ease-in-out) rounded-(--radius-xl)',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
      surface: 'default',
    },
  }
);

type SurfaceKey = NonNullable<VariantProps<typeof buttonVariants>['surface']>;
type SizeKey = NonNullable<VariantProps<typeof buttonVariants>['size']>;

const SCALE: Record<SurfaceKey, { hover: number; tap: number }> = {
  default: { hover: 1.03, tap: 0.97 },
  shadow:  { hover: 1.02, tap: 0.98 },
};

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 400, damping: 17 };

// Icon sizes auto-scaled per button size.
// Text buttons: sm=16px, md=20px.
// Icon-only buttons: sm=20px, md=24px.
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
  extends HTMLMotionProps<'button'>,
    VariantProps<typeof buttonVariants> {
  disableMotion?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
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

  const surfaceKey: SurfaceKey = surface ?? 'default';
  const scale = SCALE[surfaceKey];

  return (
    <motion.button
      className={classes}
      whileHover={{ scale: scale.hover }}
      whileTap={{ scale: scale.tap }}
      transition={SPRING_TRANSITION}
      {...props}
    >
      {content}
    </motion.button>
  );
}

export { buttonVariants };
