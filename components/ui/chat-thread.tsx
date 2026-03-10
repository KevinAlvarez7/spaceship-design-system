"use client";

import { type ReactNode, useRef, useEffect, Children } from 'react';
import { cn } from '@/lib/utils';

export interface ChatThreadProps {
  children: ReactNode;
  className?: string;
}

export function ChatThread({ children, className }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const childCount = Children.count(children);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [childCount]);

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        'overflow-y-auto',
        'px-4 pb-3 pt-5',
        className
      )}
    >
      {children}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
