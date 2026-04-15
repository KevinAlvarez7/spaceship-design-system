"use client";

import { useRef, useId, useEffect, useCallback } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ArrowUp, Square } from 'lucide-react';
import { Button } from './button'; // direct sibling import — avoids circular dep with barrel

const chatInputBoxVariants = cva(
  [
    'w-full flex flex-col gap-3',
    'min-w-(--sizing-chat-min)',
    'max-w-(--sizing-chat-max)',
    'p-3',
    'bg-(--bg-surface-base)',
    'rounded-lg',
  ],
  {
    variants: {
      surface: {
        default:         '',
        'shadow-border': 'shadow-(--shadow-border)',
      },
    },
    defaultVariants: { surface: 'shadow-border' },
  },
);

export interface ChatInputBoxProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'>,
    VariantProps<typeof chatInputBoxVariants> {
  onSubmit?: (value: string) => void;
  onStop?: () => void;
  containerClassName?: string;
  submitLabel?: string;
  stopLabel?: string;
  size?: 'md' | 'sm';
}


export function ChatInputBox({
  onSubmit,
  onStop,
  containerClassName,
  className,
  value,
  onChange,
  placeholder = 'Explore any problems, prototype any ideas...',
  disabled,
  submitLabel = 'Explore',
  stopLabel = 'Stop',
  size = 'md',
  surface,
  ...props
}: ChatInputBoxProps) {

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();

  /** Grows sm textarea up to 3-row height, then becomes scrollable. */
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el || size !== 'sm') return;
    const computed = getComputedStyle(el);
    const lineHeight = parseFloat(computed.lineHeight);
    const paddingTop = parseFloat(computed.paddingTop);
    const paddingBottom = parseFloat(computed.paddingBottom);
    const maxHeight = lineHeight * 3 + paddingTop + paddingBottom;
    el.style.height = 'auto';
    if (el.scrollHeight <= maxHeight) {
      el.style.height = `${el.scrollHeight}px`;
      el.style.overflowY = 'hidden';
    } else {
      el.style.height = `${maxHeight}px`;
      el.style.overflowY = 'auto';
    }
  }, [size]);

  useEffect(() => { autoResize(); }, [value, autoResize]);

  function handleSubmit() {
    const val = typeof value === 'string' ? value : (textareaRef.current?.value ?? '');
    onSubmit?.(val);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className={cn(chatInputBoxVariants({ surface }), containerClassName)}>
      <LabelPrimitive.Root htmlFor={textareaId} className="sr-only">
        {placeholder}
      </LabelPrimitive.Root>
      <div className="p-1">
        <textarea
          ref={textareaRef}
          id={textareaId}
          value={value}
          onChange={(e) => { onChange?.(e); autoResize(); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={size === 'sm' ? 1 : 3}
          className={cn(
            'w-full resize-none bg-transparent',
            size === 'sm' && 'overflow-hidden',
            'text-(length:--font-size-base) leading-(--line-height-base)',
            'font-(family-name:--font-family-secondary)',
            'text-(--text-primary) placeholder:text-(--text-placeholder)',
            'focus:outline-none disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
      </div>
      <div className="flex justify-end">
        {onStop ? (
          <Button
            variant="destructive"            trailingIcon={<Square />}
            onClick={onStop}
          >
            {stopLabel}
          </Button>
        ) : (
          <Button
            variant="primary"            trailingIcon={<ArrowUp />}
            disabled={disabled}
            onClick={handleSubmit}
          >
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export { chatInputBoxVariants };
