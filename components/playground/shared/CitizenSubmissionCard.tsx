'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { Button, ChatBubble, Tag } from '@/components/ui';
import type { CitizenQuote } from '@/app/_shared/citizen-voices.mock';
import { springs } from '@/tokens';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIGNAL_VARIANT = {
  supports:     'warning',
  contradicts:  'success',
  inconclusive: 'neutral',
} as const;

const SIGNAL_LABEL = {
  supports:     'Pain point',
  contradicts:  'Works fine',
  inconclusive: 'Mixed',
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CitizenSubmissionCardProps {
  /** Heading shown above the form. */
  title?: string;
  /** Citizen quotes that have already been submitted by other people. */
  recentSubmissions?: CitizenQuote[];
  /** Called when the citizen submits their experience. */
  onSubmit?: (message: string) => void;
  /** Optional pre-filled draft (used by deep-link stories to show a filled form). */
  initialDraft?: string;
  className?: string;
}

// ─── CitizenSubmissionCard ────────────────────────────────────────────────────

export function CitizenSubmissionCard({
  title = 'Share your experience',
  recentSubmissions = [],
  onSubmit,
  initialDraft = '',
  className,
}: CitizenSubmissionCardProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!draft.trim()) return;
    onSubmit?.(draft);
    setSubmitted(true);
  }

  return (
    <div className={cn('flex flex-col gap-4 w-full max-w-xl', className)}>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-(length:--font-size-2xl) leading-(--line-height-2xl) font-bold text-(--text-primary)">
          {title}
        </h2>
        <p className="font-sans [font-size:var(--font-size-sm)] leading-(--line-height-sm) text-(--text-secondary)">
          Government officers reviewing this service want to hear what worked, what didn&apos;t, and what got in your way. Your response is anonymous and helps shape what comes next.
        </p>
      </div>

      {/* ─── Form ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 p-4 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border)">
        <label
          htmlFor="citizen-submission"
          className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)"
        >
          What happened when you tried to use it?
        </label>
        <textarea
          id="citizen-submission"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          disabled={submitted}
          placeholder="Tell us what went well or what got in your way..."
          rows={4}
          className={cn(
            'w-full resize-none p-2 rounded-sm',
            'font-(family-name:--font-family-secondary)',
            '[font-size:var(--font-size-base)] leading-6',
            'text-(--text-primary) placeholder:text-(--text-placeholder)',
            'bg-(--bg-surface-secondary) outline-none',
            'focus-visible:ring-2 focus-visible:ring-(--border-input-focus)',
            submitted && 'opacity-60',
          )}
        />
        <div className="flex items-center justify-between">
          <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
            {submitted ? 'Thanks — your story was added to the evidence log.' : 'Anonymous submission'}
          </span>
          <Button
            variant="primary"
            size="sm"
            trailingIcon={<Send />}
            onClick={handleSubmit}
            disabled={submitted || !draft.trim()}
          >
            {submitted ? 'Submitted' : 'Submit'}
          </Button>
        </div>
      </div>

      {/* ─── Recent submissions ──────────────────────────────────────────── */}
      {recentSubmissions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-secondary)">
            Recent stories from others
          </h3>
          <div className="flex flex-col gap-3">
            {recentSubmissions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.interactive, delay: i * 0.05 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
                    {q.name}
                  </span>
                  <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
                    {q.context}
                  </span>
                  <Tag size="sm" variant={SIGNAL_VARIANT[q.signal]}>
                    {SIGNAL_LABEL[q.signal]}
                  </Tag>
                </div>
                <ChatBubble>{q.quote}</ChatBubble>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
