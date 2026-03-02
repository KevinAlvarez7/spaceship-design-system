import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-[var(--font-family-secondary)] font-[var(--font-weight-semibold)] transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--border-input-focus)]',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--bg-interactive-primary-default)] text-[var(--text-inverse)]',
          'hover:bg-[var(--bg-interactive-primary-hover)]',
          'active:bg-[var(--bg-interactive-primary-pressed)]',
        ],
        secondary: [
          'bg-[var(--bg-interactive-secondary-default)] text-[var(--text-primary)]',
          'hover:bg-[var(--bg-interactive-secondary-hover)]',
        ],
        outline: [
          'bg-[var(--bg-interactive-secondary-default)] text-[var(--text-interactive-primary)]',
          'hover:bg-[var(--bg-interactive-primary-default)] hover:text-[var(--text-inverse)]',
        ],
        ghost: [
          'text-[var(--text-primary)]',
          'hover:bg-[var(--bg-interactive-secondary-default)]',
        ],
        destructive: [
          'bg-[var(--bg-interactive-error-default)] text-[var(--text-inverse)]',
          'hover:bg-[var(--bg-interactive-error-hover)]',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-[var(--font-size-sm)] leading-[var(--line-height-sm)] rounded-[var(--radius-md)]',
        md: 'h-10 px-4 text-[var(--font-size-sm)] leading-[var(--line-height-sm)] rounded-[var(--radius-md)]',
        lg: 'h-12 px-6 text-[var(--font-size-base)] leading-[var(--line-height-base)] rounded-[var(--radius-lg)]',
      },
      surface: {
        default:         '',
        'neo-brutalist': 'border-2 border-[var(--border-default)] shadow-[var(--shadow-neo-brutalist)] rounded-[var(--radius-sm)]',
        professional:    'shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] transition-shadow rounded-[var(--radius-xs)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      surface: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, surface, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, surface }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
