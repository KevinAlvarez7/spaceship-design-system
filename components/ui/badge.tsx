import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-[var(--text-xs)] font-[var(--font-medium)] transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]',
        primary:     'bg-[var(--color-action-primary)] text-[var(--color-text-on-action)]',
        secondary:   'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]',
        destructive: 'bg-[var(--color-destructive)] text-[var(--color-text-inverse)]',
        outline:     'border border-[var(--color-action-primary)] text-[var(--color-action-primary)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
