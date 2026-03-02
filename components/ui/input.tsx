import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'w-full rounded-(--radius-md)',
    'bg-(--bg-input-default) px-3',
    'text-(--text-primary)',
    'placeholder:text-(--text-placeholder)',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-(--border-input-focus)',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-8  text-(--font-size-sm)',
        md: 'h-10 text-(--font-size-sm)',
        lg: 'h-12 text-(--font-size-base)',
      },
      state: {
        default: 'focus-visible:ring-(--border-input-focus)',
        error:   'focus-visible:ring-(--border-error)',
      },
      surface: {
        default:         'border',
        'shadow-border': 'shadow-(--shadow-border) focus-within:shadow-(--shadow-border-hover) transition-shadow',
      },
    },
    compoundVariants: [
      // default surface — add border colour per state
      {
        state:   'default',
        surface: 'default',
        class:   'border-(--border-input-default)',
      },
      {
        state:   'error',
        surface: 'default',
        class:   'border-(--border-error)',
      },
    ],
    defaultVariants: {
      size:    'md',
      state:   'default',
      surface: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export function Input({ className, size, state, surface, ...props }: InputProps) {
  return (
    <input
      className={cn(inputVariants({ size, state, surface }), className)}
      {...props}
    />
  );
}

export { inputVariants };
