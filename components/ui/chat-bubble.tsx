"use client";

import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chatBubbleVariants = cva(
  [
    'max-w-[75%] px-(--spacing-2xs) py-(--spacing-3xs)',
    'bg-(--bg-surface-brand-secondary)',
    'rounded-tl-(--radius-xl) rounded-bl-(--radius-xl) rounded-br-(--radius-xl)',
    'text-(length:--font-size-base) leading-(--line-height-base)',
    'font-(family-name:--font-family-secondary)',
    'text-(--text-primary)',
  ],
  {
    variants: {
      surface: {
        default: '',
        'shadow-border': 'shadow-(--shadow-border)',
      },
    },
    defaultVariants: {
      surface: 'shadow-border',
    },
  }
);

export interface ChatBubbleProps extends VariantProps<typeof chatBubbleVariants> {
  children: ReactNode;
  className?: string;
}

export function ChatBubble({ children, surface, className }: ChatBubbleProps) {
  return (
    <div className="flex w-full justify-end pl-(--spacing-2xl)">
      <div className={cn(chatBubbleVariants({ surface }), className)}>
        {children}
      </div>
    </div>
  );
}

export { chatBubbleVariants };
