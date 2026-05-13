'use client';

import { useState } from 'react';
import { Send, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Button, CheckboxGroup, CheckboxItem } from '@/components/ui';
import { SURVEY_TAGS, SURVEY_FREETEXT_PROMPT } from '@/app/_shared/citizen-voices.mock';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CitizenSurveyResult {
  rating:       number;
  selectedTags: string[];
  freeText:     string;
}

export interface CitizenSurveySceneProps {
  /** Heading shown above the survey. */
  title?:        string;
  /** Sub-heading describing the service being surveyed. */
  serviceLabel?: string;
  /** Called when the citizen submits the survey. */
  onSubmit?:     (result: CitizenSurveyResult) => void;
  /** Pre-fill rating (for filled-state stories). */
  initialRating?: number;
  className?:    string;
}

// ─── CitizenSurveyScene ───────────────────────────────────────────────────────

export function CitizenSurveyScene({
  title         = 'How was that for you?',
  serviceLabel  = 'Citizen Renewal Service',
  onSubmit,
  initialRating = 0,
  className,
}: CitizenSurveySceneProps) {
  const [rating, setRating]             = useState(initialRating);
  const [hoverRating, setHoverRating]   = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeText, setFreeText]         = useState('');
  const [submitted, setSubmitted]       = useState(false);

  function handleSubmit() {
    if (rating === 0) return;
    onSubmit?.({ rating, selectedTags, freeText });
    setSubmitted(true);
  }

  const displayRating = hoverRating || rating;

  return (
    <div className={cn('flex flex-col gap-6 w-full max-w-xl', className)}>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
          {serviceLabel} · quick survey
        </p>
        <h2 className="font-serif text-(length:--font-size-2xl) leading-(--line-height-2xl) font-bold text-(--text-primary)">
          {title}
        </h2>
      </div>

      {/* ─── Rating ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border)">
        <p className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
          Overall, how easy was it?
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <motion.button
              key={n}
              type="button"
              aria-label={`Rate ${n} of 5`}
              disabled={submitted}
              onMouseEnter={() => !submitted && setHoverRating(n)}
              onMouseLeave={() => !submitted && setHoverRating(0)}
              onClick={() => !submitted && setRating(n)}
              whileTap={submitted ? undefined : { scale: 0.9 }}
              transition={springs.interactive}
              style={{ willChange: 'transform' }}
              className={cn(
                'p-2 rounded-sm transition-colors duration-(--duration-fast)',
                !submitted && 'hover:bg-(--bg-surface-secondary) cursor-pointer',
              )}
            >
              <Star
                className={cn(
                  'h-7 w-7',
                  n <= displayRating
                    ? 'fill-(--bg-status-warning) text-(--bg-status-warning)'
                    : 'text-(--text-tertiary)',
                )}
                strokeWidth={1.5}
              />
            </motion.button>
          ))}
          <span className="ml-3 font-sans [font-size:var(--font-size-sm)] text-(--text-tertiary)">
            {rating === 0 ? 'Tap a star to rate' : `${rating} of 5`}
          </span>
        </div>
      </div>

      {/* ─── Tags ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
          What got in your way? (pick all that apply)
        </p>
        <CheckboxGroup
          value={selectedTags}
          onChange={tags => !submitted && setSelectedTags(tags)}
        >
          {SURVEY_TAGS.map(tag => (
            <CheckboxItem
              key={tag}
              value={tag}
              disabled={submitted}
            >
              {tag}
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </div>

      {/* ─── Free text ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="citizen-survey-freetext"
          className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)"
        >
          {SURVEY_FREETEXT_PROMPT}
        </label>
        <textarea
          id="citizen-survey-freetext"
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
          disabled={submitted}
          placeholder="Optional — anything that didn't fit the tags above."
          rows={3}
          className={cn(
            'w-full resize-none p-3 rounded-sm',
            'font-(family-name:--font-family-secondary)',
            '[font-size:var(--font-size-base)] leading-6',
            'text-(--text-primary) placeholder:text-(--text-placeholder)',
            'bg-(--bg-surface-base) shadow-(--shadow-border) outline-none',
            'focus-visible:ring-2 focus-visible:ring-(--border-input-focus)',
            submitted && 'opacity-60',
          )}
        />
      </div>

      {/* ─── Submit ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3">
        <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
          {submitted ? 'Thanks — your response was added to the evidence log.' : 'Takes ~30 seconds'}
        </span>
        <Button
          variant="primary"
          size="md"
          trailingIcon={<Send />}
          onClick={handleSubmit}
          disabled={submitted || rating === 0}
        >
          {submitted ? 'Submitted' : 'Submit survey'}
        </Button>
      </div>
    </div>
  );
}
