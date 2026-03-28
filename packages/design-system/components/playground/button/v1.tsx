"use client";

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { springs, scales } from '../../../tokens';

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
          'bg-(--bg-interactive-success-default) text-(--text-primary)',
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
          'py-2 px-3 gap-1',
          '[font-size:var(--font-size-sm)] leading-(--line-height-sm) rounded-sm',
        ],
        md: [
          'py-3 px-4 gap-2',
          '[font-size:var(--font-size-sm)] leading-(--line-height-sm) rounded-md',
        ],
        'icon-sm': 'h-[2.25rem] w-[2.25rem] p-0 rounded-sm',
        icon:      'h-12 w-12 p-0 rounded-md',
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

type SurfaceKey = NonNullable<VariantProps<typeof buttonVariants>['surface']>;
type SizeKey    = NonNullable<VariantProps<typeof buttonVariants>['size']>;
type VariantKey = NonNullable<VariantProps<typeof buttonVariants>['variant']>;

const SCALE: Record<SurfaceKey, typeof scales[keyof typeof scales]> = {
  default: scales.prominent,
  shadow:  scales.subtle,
};

const SPRING_TRANSITION = springs.interactive;

// ── Radial fill hover animation ──────────────────────────────────────────────
// On hover, a circle expands from the cursor entry point using Framer Motion
// variant propagation. Colors must be resolved to hex at runtime because
// motion/react cannot interpolate CSS variable references.

const BG_TOKENS: Record<VariantKey, { default: string; hover: string; pressed?: string }> = {
  primary:     { default: 'var(--bg-interactive-primary-default)',   hover: 'var(--bg-interactive-primary-hover)',   pressed: 'var(--bg-interactive-primary-pressed)' },
  secondary:   { default: 'var(--bg-interactive-secondary-default)', hover: 'var(--bg-interactive-secondary-hover)', pressed: 'var(--bg-interactive-secondary-pressed)' },
  ghost:       { default: 'transparent',                             hover: 'var(--bg-interactive-secondary-default)' },
  success:     { default: 'var(--bg-interactive-success-default)',   hover: 'var(--bg-interactive-success-hover)',   pressed: 'var(--bg-interactive-success-pressed)' },
  destructive: { default: 'var(--bg-interactive-error-default)',     hover: 'var(--bg-interactive-error-hover)',     pressed: 'var(--bg-interactive-error-pressed)' },
};

const CSS_VAR_RE = /^var\(\s*(--[^,)]+)\s*(?:,\s*(.+?))?\s*\)$/;

/** Resolves a CSS variable chain (e.g. `var(--token)`) to its computed hex value. SSR-safe. */
function resolveTokenColor(token: string): string {
  if (typeof document === 'undefined') return token;
  let current = token.trim();
  for (let depth = 0; depth < 5; depth++) {
    const m = current.match(CSS_VAR_RE);
    if (!m) break;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim();
    if (!raw) { current = m[2] ?? token; break; }
    current = raw;
  }
  return current;
}

/** Resolves BG_TOKENS to concrete colors for the motion path. Re-resolves on `data-theme` changes. */
function useButtonBgColors(variantKey: VariantKey, skip: boolean) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (skip) return;
    const mo = new MutationObserver(() => setTick(t => t + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, [skip]);

  return useMemo(() => {
    if (skip) return { default: '', hover: '', pressed: '' };
    const t = BG_TOKENS[variantKey];
    return {
      default: resolveTokenColor(t.default),
      hover:   resolveTokenColor(t.hover),
      pressed: resolveTokenColor(t.pressed ?? t.hover),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, variantKey, tick]);
}

// Icon sizes auto-scaled per button size.
// Text buttons: sm=16px, md=20px.
// Icon-only buttons: sm=20px, md=24px.
const ICON_CLASSES: Record<SizeKey, string> = {
  sm:        '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:2.75]',
  md:        '[&>svg]:h-5 [&>svg]:w-5 [&>svg]:[stroke-width:3]',
  'icon-sm': '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:2.75]',
  icon:      '[&>svg]:h-5 [&>svg]:w-5 [&>svg]:[stroke-width:3]',
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
  ...props
}: ButtonProps) {
  const sizeKey:    SizeKey    = size    ?? 'sm';
  const variantKey: VariantKey = variant ?? 'primary';
  const surfaceKey: SurfaceKey = surface ?? 'default';
  const bg = useButtonBgColors(variantKey, disableMotion || !!disabled);
  const classes = cn(buttonVariants({ variant, size, surface }), className);

  // Radial fill: capture cursor entry point and compute circle size
  const [fillOrigin, setFillOrigin] = useState({ x: 0, y: 0, size: 0 });

  function handleMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
    props.onMouseEnter?.(e);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Diameter must reach the farthest corner from the cursor entry point
    const maxDist = Math.max(
      Math.hypot(x, y),
      Math.hypot(rect.width - x, y),
      Math.hypot(x, rect.height - y),
      Math.hypot(rect.width - x, rect.height - y),
    );
    setFillOrigin({ x, y, size: Math.ceil(2 * maxDist) });
  }

  // Variant definitions — parent drives scale, child overlay drives fill color
  const scale = SCALE[surfaceKey];

  const motionVariants = { idle: { scale: 1 }, hover: { scale: scale.hover }, tap: { scale: scale.tap } };

  const overlayVariants = useMemo(() => ({
    idle:  { scale: 0, backgroundColor: bg.default },
    hover: { scale: 1, backgroundColor: bg.hover },
    tap:   { scale: 1, backgroundColor: bg.pressed },
  }), [bg.default, bg.hover, bg.pressed]);

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
      className={cn(classes, 'relative overflow-hidden')}
      onMouseEnter={handleMouseEnter}
      style={{ ...props.style, willChange: 'transform', backgroundColor: bg.default }}
      variants={motionVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      transition={SPRING_TRANSITION}
    >
      <motion.span
        variants={overlayVariants}
        className="pointer-events-none absolute rounded-full"
        style={{
          width: fillOrigin.size,
          height: fillOrigin.size,
          left: fillOrigin.x - fillOrigin.size / 2,
          top: fillOrigin.y - fillOrigin.size / 2,
          willChange: 'transform',
        }}
        transition={SPRING_TRANSITION}
      />
      <span className="relative z-10 inline-flex items-center justify-center [gap:inherit]">
        {content}
      </span>
    </motion.button>
  );
}

export { buttonVariants };
