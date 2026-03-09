"use client";

import { useRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import { Button } from './button'; // direct sibling import — avoids circular dep with barrel

const chatInputBoxVariants = cva([
  'w-full flex flex-col gap-3',
  'p-(--spacing-3xs)',
  'bg-(--bg-surface-base)',
  'rounded-(--radius-xl)',
  'shadow-(--shadow-border)',
  'data-[disabled]:opacity-50',
]);

export interface ChatInputBoxProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  onSubmit?: (value: string) => void;
  containerClassName?: string;
  submitLabel?: string;
  size?: 'md' | 'sm';
}


export function ChatInputBox({
  onSubmit,
  containerClassName,
  className,
  value,
  onChange,
  placeholder = 'Explore any problems, prototype any ideas...',
  disabled,
  submitLabel = 'Explore',
  size = 'md',
  ...props
}: ChatInputBoxProps) {

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div
      data-disabled={disabled || undefined}
      className={cn(chatInputBoxVariants(), containerClassName)}
    >
      <div className="p-(--spacing-5xs)">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={size === 'sm' ? 1 : 3}
          className={cn(
            'w-full resize-none bg-transparent',
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
        <Button
          variant="primary"
          surface="default"
          trailingIcon={<ArrowUp />}
          disabled={disabled}
          onClick={handleSubmit}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export { chatInputBoxVariants };
