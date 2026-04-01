"use client";

import { type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chatBubbleVariants = cva(
  [
    'max-w-[75%] px-4 py-3',
    'bg-(--bg-surface-brand-secondary)',
    'rounded-sm',
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
  asChild?: boolean;
  children: ReactNode;
  className?: string;
}

export function ChatBubble({ children, surface, className, asChild = false }: ChatBubbleProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <div className="flex w-full justify-end pl-16">
      <Comp className={cn(chatBubbleVariants({ surface }), className)}>
        {children}
      </Comp>
    </div>
  );
}

export { chatBubbleVariants };
