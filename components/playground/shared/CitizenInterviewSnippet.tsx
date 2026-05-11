'use client';

import { motion } from 'motion/react';
import { ShimmerText } from '@/components/ui';
import { ChatBubble, Tag } from '@/components/ui';
import type { CitizenQuote } from '@/app/_shared/citizen-voices.mock';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CitizenInterviewSnippetProps {
  /** The citizen being interviewed. */
  interviewee: { name: string; context: string };
  /** Interview quote stack — appears top to bottom. */
  quotes:      CitizenQuote[];
  /** Whether to render the "listening" indicator at the bottom. */
  listening?:  boolean;
  className?:  string;
}

// ─── CitizenInterviewSnippet ──────────────────────────────────────────────────

export function CitizenInterviewSnippet({
  interviewee,
  quotes,
  listening = false,
  className,
}: CitizenInterviewSnippetProps) {
  return (
    <div className={cn('flex flex-col gap-4 w-full max-w-xl', className)}>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
          Interview transcript · live
        </p>
        <div className="flex items-center gap-3">
          <h3 className="font-serif text-(length:--font-size-xl) leading-(--line-height-xl) font-bold text-(--text-primary)">
            {interviewee.name}
          </h3>
          <Tag size="sm" variant="neutral">{interviewee.context}</Tag>
        </div>
      </div>

      {/* ─── Quote stack ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {quotes.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.interactive, delay: i * 0.08 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <Tag size="sm" variant="info">{q.topic}</Tag>
            </div>
            <ChatBubble>{q.quote}</ChatBubble>
          </motion.div>
        ))}

        {listening && (
          <div className="flex items-center gap-3 px-3 py-2">
            <ShimmerText>Listening...</ShimmerText>
          </div>
        )}
      </div>
    </div>
  );
}
