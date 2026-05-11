'use client';

import { motion } from 'motion/react';
import { ChatBubble, Tag } from '@/components/ui';
import type { CitizenQuote } from '@/app/_shared/citizen-voices.mock';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIGNAL_VARIANT = {
  supports:     'warning',
  contradicts:  'success',
  inconclusive: 'neutral',
} as const;

const SIGNAL_LABEL = {
  supports:     'Supports problem',
  contradicts:  'Contradicts',
  inconclusive: 'Inconclusive',
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface EvidenceQuoteCardProps {
  quote:    CitizenQuote;
  /** Animation entry delay in seconds (used when tickering quotes in). */
  delay?:   number;
  className?: string;
}

// ─── EvidenceQuoteCard ────────────────────────────────────────────────────────

export function EvidenceQuoteCard({ quote, delay = 0, className }: EvidenceQuoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.interactive, delay }}
      className={cn(
        'flex flex-col gap-2 p-3 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border)',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex flex-col">
          <span className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
            {quote.name}
          </span>
          <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
            {quote.context}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Tag size="sm" variant="neutral">{quote.topic}</Tag>
          <Tag size="sm" variant={SIGNAL_VARIANT[quote.signal]}>
            {SIGNAL_LABEL[quote.signal]}
          </Tag>
        </div>
      </div>
      <ChatBubble>{quote.quote}</ChatBubble>
    </motion.div>
  );
}
