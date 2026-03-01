import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'w-full rounded-[var(--radius-md)] border',
    'bg-[var(--color-surface-sunken)] px-3',
    'text-[var(--color-text-primary)]',
    'placeholder:text-[var(--color-text-muted)]',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--color-border-focus)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-8  text-[var(--text-sm)]',
        md: 'h-10 text-[var(--text-sm)]',
        lg: 'h-12 text-[var(--text-base)]',
      },
      state: {
        default: 'border-[var(--color-border-default)] focus-visible:ring-[var(--color-border-focus)]',
        error:   'border-[var(--color-destructive)]    focus-visible:ring-[var(--color-destructive)]',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export function Input({ className, size, state, ...props }: InputProps) {
  return (
    <input
      className={cn(inputVariants({ size, state }), className)}
      {...props}
    />
  );
}

export { inputVariants };
