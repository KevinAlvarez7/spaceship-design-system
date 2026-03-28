"use client";

import { type ReactNode, useRef, useEffect, Children } from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '../../lib/utils';

export interface ChatThreadProps {
  children: ReactNode;
  className?: string;
}

export function ChatThread({ children, className }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const childArray = Children.toArray(children);
  const lastChild = childArray.at(-1);
  const lastChildKey = (lastChild && typeof lastChild === 'object' && 'key' in lastChild ? lastChild.key : null) ?? childArray.length;

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lastChildKey]);

  return (
    <ScrollAreaPrimitive.Root className={cn('overflow-hidden', className)}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full flex flex-col gap-3 px-4 pb-3 pt-5">
        {children}
        <div ref={bottomRef} aria-hidden="true" />
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="flex w-2 touch-none select-none transition-colors px-0.5 py-2"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-(--bg-surface-tertiary)" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}
