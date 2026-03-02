import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from './button'; // direct sibling import — avoids circular dep with barrel

const chatInputBoxVariants = cva(
  [
    'w-full flex flex-col gap-3 p-3',
    'bg-[var(--bg-surface-primary)]',
  ],
  {
    variants: {
      surface: {
        professional: [
          'rounded-[var(--radius-sm)]',
          'shadow-[var(--shadow-border)]',
        ],
        'neo-brutalist': [
          'rounded-[var(--radius-sm)]',
          'border-2 border-[var(--border-default)]',
          'shadow-[var(--shadow-neo-brutalist)]',
        ],
      },
    },
    defaultVariants: {
      surface: 'professional',
    },
  }
);

export interface ChatInputBoxProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'>,
    VariantProps<typeof chatInputBoxVariants> {
  onSubmit?: (value: string) => void;
  containerClassName?: string;
}

function UpArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 12V4M8 4L4 8M8 4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RightArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 8h8M12 8l-4-4M12 8l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatInputBox({
  surface = 'professional',
  onSubmit,
  containerClassName,
  className,
  value,
  onChange,
  placeholder = 'Explore any problems, prototype any ideas...',
  disabled,
  ...props
}: ChatInputBoxProps) {
  function handleSubmit() {
    if (typeof value === 'string') onSubmit?.(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className={cn(chatInputBoxVariants({ surface }), containerClassName)}>
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className={cn(
          'w-full resize-none bg-transparent',
          'text-[length:var(--font-size-base)] leading-[var(--line-height-base)]',
          'font-[family-name:var(--font-family-secondary)]',
          'text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
          'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          surface={surface}
          disabled={disabled}
          onClick={handleSubmit}
        >
          Explore
          {surface === 'neo-brutalist' ? <RightArrowIcon /> : <UpArrowIcon />}
        </Button>
      </div>
    </div>
  );
}

export { chatInputBoxVariants };
