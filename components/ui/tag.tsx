import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

type SizeKey = 'sm' | 'md';

const ICON_CLASSES: Record<SizeKey, string> = {
  sm: '[&>svg]:h-(--spacing-2xs) [&>svg]:w-(--spacing-2xs)',
  md: '[&>svg]:h-(--spacing-2xs) [&>svg]:w-(--spacing-2xs)',
};

function IconSlot({ icon, sizeKey }: { icon: ReactNode; sizeKey: SizeKey }) {
  if (!icon) return null;
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', ICON_CLASSES[sizeKey])}>
      {icon}
    </span>
  );
}

export const tagVariants = cva(
  [
    'inline-flex items-center gap-(--spacing-5xs)',
    'rounded-(--radius-full)',
    'font-(family-name:--font-family-secondary)',
    '[font-weight:var(--font-weight-semibold)]',
    'leading-none',
  ],
  {
    variants: {
      variant: {
        neutral: 'bg-(--bg-status-neutral) text-(--text-primary)',
        success: 'bg-(--bg-status-success) text-(--text-primary)',
        warning: 'bg-(--bg-status-warning) text-(--text-primary)',
        error:   'bg-(--bg-status-error)   text-(--text-primary)',
        info:    'bg-(--bg-status-info)    text-(--text-primary)',
      },
      size: {
        sm: 'px-(--spacing-4xs) py-(--spacing-5xs) [font-size:var(--font-size-xs)]',
        md: 'px-(--spacing-3xs) py-(--spacing-5xs) [font-size:var(--font-size-sm)]',
      },
      surface: {
        default:         '',
        'shadow-border': '',
      },
    },
    compoundVariants: [
      // shadow-border surface — apply shadow ring to all variants
      { variant: 'neutral', surface: 'shadow-border', class: 'shadow-(--shadow-border)' },
      { variant: 'success', surface: 'shadow-border', class: 'shadow-(--shadow-border)' },
      { variant: 'warning', surface: 'shadow-border', class: 'shadow-(--shadow-border)' },
      { variant: 'error',   surface: 'shadow-border', class: 'shadow-(--shadow-border)' },
      { variant: 'info',    surface: 'shadow-border', class: 'shadow-(--shadow-border)' },
    ],
    defaultVariants: {
      variant: 'neutral',
      size:    'md',
      surface: 'default',
    },
  }
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  leadingIcon?:  ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
}

export function Tag({
  className,
  variant,
  size,
  surface,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: TagProps) {
  const sizeKey: SizeKey = size ?? 'md';
  return (
    <span className={cn(tagVariants({ variant, size, surface }), className)} {...props}>
      <IconSlot icon={leadingIcon} sizeKey={sizeKey} />
      {children}
      <IconSlot icon={trailingIcon} sizeKey={sizeKey} />
    </span>
  );
}
