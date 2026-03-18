"use client";

import { type ReactNode, useEffect, useRef } from 'react';
import { motion, useAnimation, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { springs, scales } from '@/tokens';

type VariantKey = 'primary' | 'secondary' | 'ghost' | 'success' | 'destructive';

// CSS token names for motion-driven background color animation per variant
const VARIANT_TOKENS: Record<VariantKey, { default: string; hover: string; pressed: string | null }> = {
  primary:     { default: '--bg-interactive-primary-default',   hover: '--bg-interactive-primary-hover',   pressed: '--bg-interactive-primary-pressed' },
  secondary:   { default: '--bg-interactive-secondary-default', hover: '--bg-interactive-secondary-hover', pressed: null },
  ghost:       { default: 'transparent',                         hover: '--bg-interactive-secondary-default', pressed: null },
  success:     { default: '--bg-interactive-success-default',   hover: '--bg-interactive-success-hover',   pressed: '--bg-interactive-success-pressed' },
  destructive: { default: '--bg-interactive-error-default',     hover: '--bg-interactive-error-hover',     pressed: null },
};

// Resolves a CSS custom property to its current computed value
function resolveColor(token: string): string {
  if (token === 'transparent') return 'rgba(0,0,0,0)';
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

const COLOR_TRANSITION   = { duration: 0.35, ease: 'easeOut' as const };
const PRESSED_TRANSITION = { duration: 0.08, ease: 'easeOut' as const };

// hover/active CSS classes used only for the static (disableMotion / disabled) path
const STATIC_HOVER: Record<VariantKey, string[]> = {
  primary:     ['hover:bg-(--bg-interactive-primary-hover)', 'active:bg-(--bg-interactive-primary-pressed)'],
  secondary:   ['hover:bg-(--bg-interactive-secondary-hover)'],
  ghost:       ['hover:bg-(--bg-interactive-secondary-default)'],
  success:     ['hover:bg-(--bg-interactive-success-hover)', 'active:bg-(--bg-interactive-success-pressed)'],
  destructive: ['hover:bg-(--bg-interactive-error-hover)'],
};

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'font-sans [font-weight:var(--font-weight-semibold)]',
    // No transition-colors — the motion path drives color via useAnimation;
    // the static path re-adds it alongside STATIC_HOVER.
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-(--border-input-focus)',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        primary:     ['bg-(--bg-interactive-primary-default) text-(--text-inverse)'],
        secondary:   ['bg-(--bg-interactive-secondary-default) text-(--text-primary)'],
        ghost:       ['text-(--text-primary)'],
        success:     ['bg-(--bg-interactive-success-default) text-(--text-inverse)'],
        destructive: ['bg-(--bg-interactive-error-default) text-(--text-inverse)'],
      },
      size: {
        sm: [
          'py-1.5 px-2.5 gap-1',
          '[font-size:var(--font-size-sm)] leading-(--line-height-sm) rounded',
        ],
        md: [
          'py-2 px-3 gap-1',
          '[font-size:var(--font-size-sm)] leading-(--line-height-sm) rounded-sm',
        ],
        lg: [
          'py-3 px-4 gap-2',
          '[font-size:var(--font-size-sm)] leading-(--line-height-sm) rounded-md',
        ],
        'icon-sm': 'h-8 w-8 p-0 rounded',
        'icon-md': 'h-9 w-9 p-0 rounded-sm',
        'icon-lg': 'h-11 w-11 p-0 rounded-md',
      },
      surface: {
        default: '',
        shadow:  'shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow duration-(--duration-base) ease-(--ease-in-out)',
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
type SizeKey    = NonNullable<VariantProps<typeof buttonVariants>['size']>;

const SCALE: Record<SurfaceKey, typeof scales[keyof typeof scales]> = {
  default: scales.prominent,
  shadow:  scales.subtle,
};

const SPRING_TRANSITION = springs.interactive;

// Icon sizes auto-scaled per button size.
// Text buttons: sm=14px, md=16px, lg=20px.
// Icon-only buttons: sm=14px, md=16px, lg=20px.
const ICON_CLASSES: Record<SizeKey, string> = {
  sm:        '[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:[stroke-width:2.5]',
  md:        '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:2.75]',
  lg:        '[&>svg]:h-5 [&>svg]:w-5 [&>svg]:[stroke-width:3]',
  'icon-sm': '[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:[stroke-width:2.5]',
  'icon-md': '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:2.75]',
  'icon-lg': '[&>svg]:h-5 [&>svg]:w-5 [&>svg]:[stroke-width:3]',
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
  icon?: ReactNode;
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
  icon,
  children,
  onHoverStart,
  onHoverEnd,
  onTapStart,
  onTap,
  onTapCancel,
  ...props
}: ButtonProps) {
  const sizeKey:    SizeKey    = size    ?? 'md';
  const surfaceKey: SurfaceKey = surface ?? 'default';
  const variantKey: VariantKey = (variant ?? 'primary') as VariantKey;
  const tokens = VARIANT_TOKENS[variantKey];

  const classes = cn(buttonVariants({ variant, size, surface }), className);
  const scale = SCALE[surfaceKey];
  const motionVariants = { idle: { scale: 1 }, hover: { scale: scale.hover }, tap: { scale: scale.tap } };

  const colorControls = useAnimation();
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    colorControls.set({ backgroundColor: resolveColor(tokens.default) });
    return () => { mountedRef.current = false; };
  }, [variantKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const content = icon ? (
    <IconSlot icon={icon} sizeKey={sizeKey} />
  ) : (
    <>
      <IconSlot icon={leadingIcon} sizeKey={sizeKey} />
      {children}
      <IconSlot icon={trailingIcon} sizeKey={sizeKey} />
    </>
  );

  if (disableMotion || disabled) {
    return (
      <button
        className={cn(
          classes,
          'transition-colors duration-(--duration-base) ease-(--ease-in-out)',
          STATIC_HOVER[variantKey],
        )}
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
      variants={motionVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      animate={colorControls}
      transition={SPRING_TRANSITION}
      onHoverStart={(e, info) => {
        if (mountedRef.current) {
          colorControls.start({ backgroundColor: resolveColor(tokens.hover) }, COLOR_TRANSITION);
        }
        onHoverStart?.(e, info);
      }}
      onHoverEnd={(e, info) => {
        if (mountedRef.current) {
          colorControls.start({ backgroundColor: resolveColor(tokens.default) }, COLOR_TRANSITION);
        }
        onHoverEnd?.(e, info);
      }}
      onTapStart={(e, info) => {
        if (mountedRef.current && tokens.pressed) {
          colorControls.start({ backgroundColor: resolveColor(tokens.pressed) }, PRESSED_TRANSITION);
        }
        onTapStart?.(e, info);
      }}
      onTap={(e, info) => {
        // Cursor is still over button after tap — return to hover color
        if (mountedRef.current) {
          colorControls.start({ backgroundColor: resolveColor(tokens.hover) }, COLOR_TRANSITION);
        }
        onTap?.(e, info);
      }}
      onTapCancel={(e, info) => {
        // Pointer moved away during press — return to default
        if (mountedRef.current) {
          colorControls.start({ backgroundColor: resolveColor(tokens.default) }, COLOR_TRANSITION);
        }
        onTapCancel?.(e, info);
      }}
    >
      {content}
    </motion.button>
  );
}

export { buttonVariants };
