"use client";

import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

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
        '[&_ul]:list-disc [&_ul]:pl-(--spacing-xs) [&_ul]:space-y-(--spacing-5xs)',
        '[&_ol]:list-decimal [&_ol]:pl-(--spacing-xs) [&_ol]:space-y-(--spacing-5xs)',
        '[&_p]:mb-(--spacing-4xs) [&_p:last-child]:mb-0',
        '[&_strong]:[font-weight:var(--font-weight-semibold)]',
        '[&_code]:font-(family-name:--font-family-mono) [&_code]:text-[0.875em] [&_code]:bg-(--bg-surface-secondary) [&_code]:px-(--spacing-5xs) [&_code]:rounded-(--radius-sm)',
        className
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
      {isStreaming && (
        disableMotion ? (
          <span className="inline-block w-(--spacing-6xs) h-(--spacing-xs) bg-(--text-primary) ml-(--spacing-6xs) rounded-(--radius-sm) align-middle" />
        ) : (
          <motion.span
            className="inline-block w-(--spacing-6xs) h-(--spacing-xs) bg-(--text-primary) ml-(--spacing-6xs) rounded-(--radius-sm) align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        )
      )}
    </div>
  );
}
