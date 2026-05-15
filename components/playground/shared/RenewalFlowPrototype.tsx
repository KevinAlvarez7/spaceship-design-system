'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MessageSquareWarning,
} from 'lucide-react';
import { Button, ChatBubble, Tag } from '@/components/ui';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';
import {
  RENEWAL_SCREENS,
  type RenewalScreen,
  type RenewalAnnotation,
  type RenewalField,
} from '@/app/_shared/renewal-flow.mock';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIGNAL_VARIANT = {
  supports:     'warning',
  contradicts:  'success',
  inconclusive: 'neutral',
} as const;

const SIGNAL_LABEL = {
  supports:     'Supports issue',
  contradicts:  'Works fine',
  inconclusive: 'Unclear',
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RenewalFlowPrototypeProps {
  /** Screens to render (defaults to RENEWAL_SCREENS from the mock). */
  screens?:     RenewalScreen[];
  /** Start at a specific step (1-indexed). */
  initialStep?: number;
  className?:   string;
}

// ─── RenewalFlowPrototype ─────────────────────────────────────────────────────

export function RenewalFlowPrototype({
  screens = RENEWAL_SCREENS,
  initialStep = 2,
  className,
}: RenewalFlowPrototypeProps) {
  const [stepIndex, setStepIndex] = useState(
    Math.max(0, Math.min(initialStep - 1, screens.length - 1)),
  );
  const screen = screens[stepIndex];

  const dropOff = useMemo(() => {
    if (screen.entered === 0) return 0;
    return Math.round(((screen.entered - screen.completed) / screen.entered) * 100);
  }, [screen]);

  return (
    <div className={cn('flex flex-col w-full min-h-0 p-6 gap-4 bg-(--bg-surface-secondary)', className)}>

      {/* ─── Header — screen meta ────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <p className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
            Service prototype · Citizen renewal flow
          </p>
          <h2 className="font-serif text-(length:--font-size-xl) leading-(--line-height-xl) font-bold text-(--text-primary)">
            Step {screen.step} · {screen.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {screen.isFailurePoint && (
            <Tag size="sm" variant="error" leadingIcon={<AlertTriangle className="h-3 w-3" />}>
              Failure point
            </Tag>
          )}
          <Tag size="sm" variant={dropOff >= 30 ? 'error' : dropOff >= 15 ? 'warning' : 'success'}>
            {dropOff}% drop-off here
          </Tag>
        </div>
      </div>

      {/* ─── Body — device frame + annotation column ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 min-h-0">

        {/* ── Device frame ─────────────────────────────────────────── */}
        <div className="flex flex-col rounded-2xl bg-(--bg-surface-base) shadow-(--shadow-border) overflow-hidden">

          {/* Faux URL bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-(--bg-surface-tertiary) border-b border-(--border-default)">
            <span className="size-2 rounded-full bg-(--bg-status-error)" />
            <span className="size-2 rounded-full bg-(--bg-status-warning)" />
            <span className="size-2 rounded-full bg-(--bg-status-success)" />
            <span className="ml-2 font-mono [font-size:var(--font-size-xs)] text-(--text-tertiary) truncate">
              services.gov.example/renewal/step-{screen.step}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={screen.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={springs.interactive}
              className="flex flex-col gap-4 p-6"
            >
              {screen.subtitle && (
                <p className="font-sans [font-size:var(--font-size-sm)] text-(--text-secondary)">
                  {screen.subtitle}
                </p>
              )}

              {screen.fields.map(field => (
                <FauxField key={field.id} field={field} />
              ))}

              {/* Faux submit row */}
              <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-(--border-default)">
                <Button variant="ghost" size="sm" disabled>Back</Button>
                <Button variant="primary" size="sm" disabled>Continue</Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Annotation column ────────────────────────────────────── */}
        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="size-4 text-(--text-tertiary)" />
            <p className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
              {screen.annotations.length} citizen {screen.annotations.length === 1 ? 'note' : 'notes'}
            </p>
          </div>

          {screen.annotations.length === 0 ? (
            <div className="rounded-lg p-3 bg-(--bg-surface-base) shadow-(--shadow-border)">
              <p className="font-sans [font-size:var(--font-size-sm)] text-(--text-tertiary)">
                No citizen feedback pinned here yet.
              </p>
            </div>
          ) : (
            screen.annotations.map((a, i) => (
              <AnnotationCard key={a.id} annotation={a} delay={i * 0.06} />
            ))
          )}
        </div>
      </div>

      {/* ─── Footer — funnel + step nav ──────────────────────────────── */}
      <FunnelStrip
        screens={screens}
        activeIndex={stepIndex}
        onSelect={setStepIndex}
      />

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<ChevronLeft />}
          disabled={stepIndex === 0}
          onClick={() => setStepIndex(i => Math.max(0, i - 1))}
        >
          Previous step
        </Button>
        <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
          {screen.completed} of 100 starters completed this step · avg {formatTime(screen.avgTimeSec)}
        </span>
        <Button
          variant="secondary"
          size="sm"
          trailingIcon={<ChevronRight />}
          disabled={stepIndex === screens.length - 1}
          onClick={() => setStepIndex(i => Math.min(screens.length - 1, i + 1))}
        >
          Next step
        </Button>
      </div>
    </div>
  );
}

// ─── FauxField ────────────────────────────────────────────────────────────────

function FauxField({ field }: { field: RenewalField }) {
  if (field.kind === 'heading') {
    return (
      <h3 className="font-serif text-(length:--font-size-lg) leading-(--line-height-lg) font-bold text-(--text-primary)">
        {field.label}
      </h3>
    );
  }

  if (field.kind === 'label-value') {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
          {field.label}
        </span>
        <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-primary)">
          {field.value ?? '—'}
        </span>
      </div>
    );
  }

  if (field.kind === 'radio-group' || field.kind === 'dropdown') {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 p-3 rounded-lg shadow-(--shadow-border)',
          field.flagged ? 'bg-(--bg-status-error) ring-1 ring-(--border-error)' : 'bg-(--bg-surface-base)',
        )}
        id={field.id}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
            {field.label}
          </span>
          {field.flagged && (
            <Tag size="sm" variant="error" leadingIcon={<AlertTriangle className="h-3 w-3" />}>
              Flagged
            </Tag>
          )}
        </div>
        {field.helpText && (
          <p className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
            {field.helpText}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          {(field.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-sm bg-(--bg-surface-secondary)">
              <span className="size-3 rounded-full ring-1 ring-(--border-default) bg-(--bg-surface-base)" />
              <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-primary)">{opt}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.kind === 'text-input') {
    return (
      <div className="flex flex-col gap-1" id={field.id}>
        <span className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
          {field.label}
        </span>
        <div className="h-9 rounded-md bg-(--bg-surface-base) shadow-(--shadow-border) px-3 flex items-center font-sans [font-size:var(--font-size-sm)] text-(--text-tertiary)">
          {field.value || 'Enter here…'}
        </div>
      </div>
    );
  }

  if (field.kind === 'checkbox') {
    return (
      <div className="flex items-center gap-2 p-2" id={field.id}>
        <span className="size-4 rounded-sm shadow-(--shadow-border) bg-(--bg-surface-base)" />
        <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-primary)">
          {field.label}
        </span>
      </div>
    );
  }

  if (field.kind === 'review-summary') {
    return (
      <div className="flex flex-col gap-1 p-3 rounded-lg bg-(--bg-surface-secondary)">
        <span className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
          {field.label}
        </span>
        <span className="font-sans [font-size:var(--font-size-base)] font-semibold text-(--text-primary)">
          {field.value ?? '—'}
        </span>
      </div>
    );
  }

  return null;
}

// ─── AnnotationCard ───────────────────────────────────────────────────────────

function AnnotationCard({ annotation, delay = 0 }: { annotation: RenewalAnnotation; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.interactive, delay }}
      className="flex flex-col gap-2 p-3 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border)"
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex flex-col">
          <span className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
            {annotation.citizen}
          </span>
          <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
            {annotation.context}
          </span>
        </div>
        <Tag size="sm" variant={SIGNAL_VARIANT[annotation.signal]}>
          {SIGNAL_LABEL[annotation.signal]}
        </Tag>
      </div>
      <ChatBubble>{annotation.quote}</ChatBubble>
    </motion.div>
  );
}

// ─── FunnelStrip ──────────────────────────────────────────────────────────────

function FunnelStrip({
  screens,
  activeIndex,
  onSelect,
}: {
  screens:    RenewalScreen[];
  activeIndex: number;
  onSelect:    (i: number) => void;
}) {
  return (
    <div className="flex items-end gap-2 p-3 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border)">
      {screens.map((s, i) => {
        const isActive = i === activeIndex;
        const height = `${Math.max(8, s.completed)}%`;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              'flex flex-col gap-1 flex-1 min-w-0 p-2 rounded-sm transition-colors text-left',
              isActive ? 'bg-(--bg-surface-secondary)' : 'hover:bg-(--bg-surface-secondary)',
            )}
          >
            <div className="flex items-end h-12">
              <div
                className={cn(
                  'w-full rounded-sm transition-colors',
                  isActive ? 'bg-(--bg-interactive-primary-default)' : 'bg-(--bg-surface-tertiary)',
                  s.isFailurePoint && !isActive && 'bg-(--bg-status-error)',
                )}
                style={{ height }}
              />
            </div>
            <span className="font-sans [font-size:var(--font-size-xs)] font-semibold text-(--text-primary)">
              Step {s.step}
            </span>
            <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary) truncate">
              {s.completed}/100
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}
