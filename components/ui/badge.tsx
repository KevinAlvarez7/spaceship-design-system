import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-(--radius-full) px-2.5 py-0.5 text-(--font-size-xs) font-(--font-weight-semibold) transition-colors',
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
      {
        variant: 'default',
        surface: 'default',
        class:   'border border-(--border-default)',
      },
      {
        variant: 'secondary',
        surface: 'default',
        class:   'border border-(--border-default)',
      },
      {
        variant: 'outline',
        surface: 'default',
        class:   'border border-(--border-input-focus)',
      },
      // shadow-border surface — replace border with shadow ring
      {
        variant: 'default',
        surface: 'shadow-border',
        class:   'shadow-(--shadow-border)',
      },
      {
        variant: 'secondary',
        surface: 'shadow-border',
        class:   'shadow-(--shadow-border)',
      },
      {
        variant: 'outline',
        surface: 'shadow-border',
        class:   'shadow-(--shadow-border)',
      },
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
