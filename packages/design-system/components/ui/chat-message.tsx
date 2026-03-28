"use client";

import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '../../lib/utils';

export interface ChatMessageProps {
  content: string;
  isStreaming?: boolean;
  disableMotion?: boolean;
  className?: string;
}

export function ChatMessage({
  content,
  isStreaming = false,
  disableMotion = false,
  className,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        'w-full',
        'text-(length:--font-size-base) leading-(--line-height-base)',
        'font-(family-name:--font-family-secondary)',
        'text-(--text-primary)',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1',
        '[&_p]:mb-2 [&_p:last-child]:mb-0',
        '[&_strong]:[font-weight:var(--font-weight-semibold)]',
        '[&_code]:font-(family-name:--font-family-mono) [&_code]:text-[0.875em] [&_code]:bg-(--bg-surface-secondary) [&_code]:px-1 [&_code]:rounded-sm',
        className
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
      {isStreaming && <VisuallyHidden>Message is being generated</VisuallyHidden>}
      {isStreaming && (
        disableMotion ? (
          <span className="inline-block w-0.5 h-5 bg-(--text-primary) ml-0.5 rounded-sm align-middle" />
        ) : (
          <motion.span
            className="inline-block w-0.5 h-5 bg-(--text-primary) ml-0.5 rounded-sm align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        )
      )}
    </div>
  );
}
