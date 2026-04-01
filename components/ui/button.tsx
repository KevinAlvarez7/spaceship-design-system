"use client";

import { type ReactNode, useEffect, useRef, forwardRef } from 'react';
import { motion, useAnimation, type HTMLMotionProps } from 'motion/react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { springs, scales } from '@/tokens';

type VariantKey = 'primary' | 'secondary' | 'ghost' | 'success' | 'destructive';

type TokenSet = { default: string; hover: string; pressed: string | null };

// CSS token names for motion-driven background color animation per variant.
// For secondary, tokens are surface-aware — see getMotionTokens().
const VARIANT_TOKENS: Record<VariantKey, TokenSet> = {
  primary:     { default: '--bg-interactive-primary-default', hover: '--bg-interactive-primary-hover',  pressed: '--bg-interactive-primary-pressed' },
  secondary:   { default: 'transparent',                      hover: '--bg-interactive-secondary-default', pressed: '--bg-interactive-secondary-hover' },
  ghost:       { default: 'transparent',                      hover: '--bg-surface-tertiary',           pressed: '--bg-interactive-secondary-pressed' },
  success:     { default: '--bg-interactive-success-default', hover: '--bg-interactive-success-hover',  pressed: '--bg-interactive-success-pressed' },
  destructive: { default: '--bg-interactive-error-default',   hover: '--bg-interactive-error-hover',    pressed: null },
};

/** Returns surface-aware motion tokens. Secondary shadow uses white fill; secondary flat uses transparent. */
function getMotionTokens(variant: VariantKey, surface: SurfaceKey): TokenSet {
  if (variant === 'secondary') {
    return surface === 'shadow'
      ? { default: '--bg-surface-base', hover: '--bg-surface-primary',             pressed: '--bg-surface-secondary' }
      : { default: 'transparent',       hover: '--bg-interactive-secondary-default', pressed: '--bg-interactive-secondary-hover' };
  }
  return VARIANT_TOKENS[variant];
}

import { resolveColor, toAlphaZero } from '@/lib/resolve-color';

const COLOR_TRANSITION   = { duration: 0.33, ease: 'easeOut' as const };
const PRESSED_TRANSITION = { duration: 0.08, ease: 'easeOut' as const };

// hover/active CSS classes used only for the static (disableMotion / disabled) path.
// For secondary, classes are surface-aware — see getStaticHover().
const STATIC_HOVER: Record<VariantKey, string[]> = {
  primary:     ['hover:bg-(--bg-interactive-primary-hover)', 'active:bg-(--bg-interactive-primary-pressed)'],
  secondary:   ['hover:bg-(--bg-interactive-secondary-default)', 'active:bg-(--bg-interactive-secondary-hover)'],
  ghost:       ['hover:bg-(--bg-surface-tertiary)', 'active:bg-(--bg-interactive-secondary-pressed)'],
  success:     ['hover:bg-(--bg-interactive-success-hover)', 'active:bg-(--bg-interactive-success-pressed)'],
  destructive: ['hover:bg-(--bg-interactive-error-hover)'],
};

/** Returns surface-aware static hover classes for the disableMotion / disabled path. */
function getStaticHover(variant: VariantKey, surface: SurfaceKey): string[] {
  if (variant === 'secondary') {
    return surface === 'shadow'
      ? ['hover:bg-(--bg-surface-primary)', 'active:bg-(--bg-surface-secondary)']
      : ['hover:bg-(--bg-interactive-secondary-default)', 'active:bg-(--bg-interactive-secondary-hover)'];
  }
  return STATIC_HOVER[variant];
}

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
        secondary:   ['bg-transparent text-(--text-primary)'],
        ghost:       ['bg-transparent text-(--text-primary)'],
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
          'py-2.5 px-3.5 gap-2',
          '[font-size:var(--font-size-base)] leading-(--line-height-sm) rounded-md',
        ],
        'icon-sm': 'h-8 w-8 p-0 rounded',
        'icon-md': 'h-9 w-9 p-0 rounded-sm',
        'icon-lg': 'h-11 w-11 p-0 rounded-md',
      },
      surface: {
        flat:   '',
        shadow: 'shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow duration-(--duration-base) ease-(--ease-in-out)',
      },
    },
    compoundVariants: [
      // Secondary + shadow: white fill (shadow-border supplies the shape)
      { variant: 'secondary', surface: 'shadow', className: 'bg-(--bg-surface-base)' },
      // Ghost never uses shadow — strip it to flat appearance
      { variant: 'ghost', surface: 'shadow', className: 'shadow-none hover:shadow-none' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      surface: 'flat',
    },
  }
);

type SurfaceKey = NonNullable<VariantProps<typeof buttonVariants>['surface']>;
type SizeKey    = NonNullable<VariantProps<typeof buttonVariants>['size']>;

const SCALE: Record<SurfaceKey, typeof scales[keyof typeof scales]> = {
  flat:   scales.prominent,
  shadow: scales.subtle,
};

const SPRING_TRANSITION = springs.interactive;

// Icon sizes auto-scaled per button size.
// Text buttons: sm=14px, md=16px, lg=20px.
// Icon-only buttons: sm=14px, md=16px, lg=20px.
const ICON_CLASSES: Record<SizeKey, string> = {
  sm:        '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:2.5]',
  md:        '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:2.75]',
  lg:        '[&>svg]:h-5 [&>svg]:w-5 [&>svg]:[stroke-width:3]',
  'icon-sm': '[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:[stroke-width:2.5]',
  'icon-md': '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:2.75]',
  'icon-lg': '[&>svg]:h-5 [&>svg]:w-5 [&>svg]:[stroke-width:3]',
};

/** Gap class for the inner content span when isolateScale is true. */
const GAP_CLASSES: Record<SizeKey, string> = {
  sm:        'gap-1',
  md:        'gap-1',
  lg:        'gap-2',
  'icon-sm': '',
  'icon-md': '',
  'icon-lg': '',
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
  asChild?: boolean;
  disableMotion?: boolean;
  /** Move scale animation to an inner motion.span so the button's bounding rect stays
   *  stable. Use when the Button is a Radix DropdownMenuTrigger — prevents dropdown shift. */
  isolateScale?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  className,
  variant,
  size,
  surface,
  asChild = false,
  disableMotion = false,
  isolateScale = false,
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
}, ref) {
  const sizeKey:    SizeKey    = size    ?? 'md';
  const surfaceKey: SurfaceKey = surface ?? 'flat';
  const variantKey: VariantKey = (variant ?? 'primary') as VariantKey;
  const tokens = getMotionTokens(variantKey, surfaceKey);

  // Transparent buttons (ghost, flat secondary) use CSS transitions for bg color —
  // Motion's JS interpolator does not apply CSS's "preserve source RGB channels for
  // transparent" rule, causing dark intermediate states when animating from rgba(0,0,0,0).
  const isTransparentBg = tokens.default === 'transparent';

  const classes = cn(buttonVariants({ variant, size, surface }), className);
  const scale = SCALE[surfaceKey];
  const motionVariants = { idle: { scale: 1 }, hover: { scale: scale.hover }, tap: { scale: scale.tap } };

  const colorControls = useAnimation();
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    // Transparent buttons start from hover-color-at-0-alpha so Motion only interpolates
    // the alpha channel on hover — avoids dark intermediate states from black RGB channels.
    colorControls.set({
      backgroundColor: isTransparentBg
        ? toAlphaZero(resolveColor(tokens.hover))
        : resolveColor(tokens.default),
    });
    return () => { mountedRef.current = false; };
  }, [variantKey, surfaceKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const content = icon ? (
    <IconSlot icon={icon} sizeKey={sizeKey} />
  ) : (
    <>
      <IconSlot icon={leadingIcon} sizeKey={sizeKey} />
      {children}
      <IconSlot icon={trailingIcon} sizeKey={sizeKey} />
    </>
  );

  if (asChild) {
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          classes,
          'transition-colors duration-(--duration-base) ease-(--ease-in-out)',
          getStaticHover(variantKey, surfaceKey),
        )}
        {...(props as React.HTMLAttributes<HTMLElement>)}
      >
        {children}
      </Slot>
    );
  }

  if (disableMotion || disabled) {
    return (
      <button
        ref={ref}
        className={cn(
          classes,
          'transition-colors duration-(--duration-base) ease-(--ease-in-out)',
          getStaticHover(variantKey, surfaceKey),
        )}
        disabled={disabled}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }

  // Deferred — called only in client-side event handlers, never during SSR render.
  const getRestBg = () => isTransparentBg
    ? toAlphaZero(resolveColor(tokens.hover))
    : resolveColor(tokens.default);

  // When isolateScale, the outer button has a stable bounding rect (no scale) and the
  // inner motion.span applies the scale animation via variant propagation.
  const outerVariants = isolateScale
    ? { idle: { scale: 1 }, hover: { scale: 1 }, tap: { scale: 1 } }
    : motionVariants;

  return (
    <motion.button
      ref={ref}
      {...props}
      className={classes}
      style={{ ...props.style, ...(isolateScale ? {} : { willChange: 'transform' }) }}
      variants={outerVariants}
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
          colorControls.start({ backgroundColor: getRestBg() }, COLOR_TRANSITION);
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
        // Pointer moved away during press — return to rest
        if (mountedRef.current) {
          colorControls.start({ backgroundColor: getRestBg() }, COLOR_TRANSITION);
        }
        onTapCancel?.(e, info);
      }}
    >
      {isolateScale ? (
        <motion.span
          className={cn('inline-flex items-center', GAP_CLASSES[sizeKey])}
          style={{ willChange: 'transform' }}
          variants={motionVariants}
          transition={SPRING_TRANSITION}
        >
          {content}
        </motion.span>
      ) : content}
    </motion.button>
  );
});
Button.displayName = 'Button';

export { buttonVariants };
