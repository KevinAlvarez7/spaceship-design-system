import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-[var(--font-medium)] transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--color-border-focus)]',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-action-primary)] text-[var(--color-text-on-action)]',
          'hover:bg-[var(--color-action-primary-hover)]',
          'active:bg-[var(--color-action-primary-active)]',
        ],
        secondary: [
          'bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)]',
          'border border-[var(--color-border-default)]',
          'hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-border-strong)]',
        ],
        outline: [
          'border border-[var(--color-action-primary)] text-[var(--color-action-primary)]',
          'hover:bg-[var(--color-action-primary)] hover:text-[var(--color-text-on-action)]',
        ],
        ghost: [
          'text-[var(--color-text-primary)]',
          'hover:bg-[var(--color-surface-sunken)]',
        ],
        destructive: [
          'bg-[var(--color-destructive)] text-[var(--color-text-inverse)]',
          'hover:bg-[var(--color-destructive-hover)]',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-[var(--text-sm)] rounded-[var(--radius-md)]',
        md: 'h-10 px-4 text-[var(--text-sm)] rounded-[var(--radius-md)]',
        lg: 'h-12 px-6 text-[var(--text-base)] rounded-[var(--radius-lg)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
