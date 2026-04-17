"use client";

import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import React, { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Types ───────────────────────────────────────────────────────────────────

/** A single option item — either a plain string or an object with an optional icon. */
export type ClarificationOption = string | { label: string; icon?: ReactNode };

/** Returns the display label of an option regardless of its form. */
export function optionLabel(opt: ClarificationOption): string {
  return typeof opt === 'string' ? opt : opt.label;
}

/** Returns the icon of an option, or undefined for plain strings. */
export function optionIcon(opt: ClarificationOption): ReactNode | undefined {
  return typeof opt === 'string' ? undefined : opt.icon;
}

export type ClarificationQuestion =
  | { type?: 'single'; label: string; options: ClarificationOption[]; freeText?: boolean }
  | { type: 'multi';   label: string; options: ClarificationOption[]; freeText?: boolean }
  | { type: 'rank';    label: string; items: string[] };

export type ClarificationAnswer =
  | { type: 'single'; index: number; freeText?: string }
  | { type: 'multi';  indices: number[]; freeText?: string }
  | { type: 'rank';   order: string[] }
  | null;

// ─── CVA ─────────────────────────────────────────────────────────────────────

export const clarificationCardVariants = cva(
  [
    'flex flex-col w-full',
    'min-w-(--sizing-chat-min) max-w-(--sizing-chat-max)',
    'font-sans bg-(--bg-surface-base) rounded-lg overflow-hidden',
    'outline-none',
    'focus-visible:ring-2 focus-visible:ring-(--border-input-focus)',
  ],
  {
    variants: {
      surface: {
        default:         '',
        'shadow-border': 'shadow-(--shadow-border)',
      },
      /** Heavier visual treatment for "mode-setter" cards (e.g. IntentGateCard, AcknowledgementGate). */
      weight: {
        default:   '',
        prominent: 'shadow-(--shadow-border-hover) bg-(--bg-surface-primary)',
      },
    },
    defaultVariants: { surface: 'shadow-border', weight: 'default' },
  }
);

export type ClarificationCardBaseProps = VariantProps<typeof clarificationCardVariants>;

// ─── Constants ───────────────────────────────────────────────────────────────

/** Ease-out cubic — matches the spec's fast snappy transitions. */
export const SLIDE_EASE = [0.4, 0, 0.2, 1] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the question type ('single' for undefined type). */
export function qtype(q: ClarificationQuestion): 'single' | 'multi' | 'rank' {
  return ('type' in q && q.type) ? q.type : 'single';
}

/** Returns combined className for an option row based on focus/selected state. */
export function optionRowClass(isFocused: boolean, isSelected: boolean): string {
  if (isFocused) return 'bg-(--bg-surface-secondary) text-(--text-primary)';
  if (isSelected) return 'text-(--text-primary)';
  return 'text-(--text-tertiary)';
}

/** Returns true if the answer has the given option index selected. */
export function isIndexSelected(answer: ClarificationAnswer, oi: number): boolean {
  if (!answer) return false;
  if (answer.type === 'single') return answer.index === oi;
  if (answer.type === 'multi')  return answer.indices.includes(oi);
  return false;
}

/** Returns true if the given answer is non-empty (has something selected). */
export function hasAnswer(answer: ClarificationAnswer): boolean {
  if (!answer) return false;
  if (answer.type === 'single') return true;
  if (answer.type === 'multi')  return answer.indices.length > 0;
  if (answer.type === 'rank')   return true;
  return false;
}

/** Returns status text based on question type and selection state. */
export function statusText(qt: 'single' | 'multi' | 'rank', answer: ClarificationAnswer): string {
  if (qt === 'rank') return 'Please rank these options to your priority';
  if (qt === 'single') {
    if (!answer || answer.type !== 'single') return 'Please select 1 option';
    return '1 selected';
  }
  // multi
  if (!answer || answer.type !== 'multi' || answer.indices.length === 0) {
    return 'Please select 1 or more options';
  }
  return `${answer.indices.length} selected`;
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
  total:    number;
  current:  number;
  onJumpTo: (idx: number) => void;
}

export function ProgressBar({ total, current, onJumpTo }: ProgressBarProps) {
  return (
    <div className="flex gap-1 px-4 pt-4">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to question ${i + 1}`}
          onClick={() => onJumpTo(i)}
          className={cn(
            'h-0.5 flex-1 rounded-full cursor-pointer transition-colors duration-(--duration-fast)',
            i <= current ? 'bg-(--text-primary)' : 'bg-(--bg-surface-tertiary)',
          )}
        />
      ))}
    </div>
  );
}

// ─── SummaryView ─────────────────────────────────────────────────────────────

interface SummaryViewProps {
  questions: ClarificationQuestion[];
  answers:   ClarificationAnswer[];
}

export function SummaryView({ questions, answers }: SummaryViewProps) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <p className="[font-size:var(--font-size-xs)] font-semibold text-(--text-primary)">
        Submitted
      </p>
      {questions.map((q, qi) => {
        const ans     = answers[qi];
        const qt      = qtype(q);
        let displayValue: string;
        let skipped = false;

        if (!ans) {
          displayValue = 'Skipped';
          skipped = true;
        } else if (ans.type === 'single') {
          const opts   = 'options' in q ? q.options : [];
          const chosen = opts[ans.index] !== undefined ? optionLabel(opts[ans.index]) : undefined;
          displayValue = ans.freeText ? `${chosen}: ${ans.freeText}` : (chosen ?? 'Skipped');
        } else if (ans.type === 'multi') {
          const opts = 'options' in q ? q.options : [];
          if (ans.indices.length === 0) {
            displayValue = 'Skipped';
            skipped = true;
          } else {
            const labels = ans.indices.map(i => opts[i] !== undefined ? optionLabel(opts[i]) : '').filter(Boolean);
            displayValue = labels.join(', ');
            if (ans.freeText) displayValue += `: ${ans.freeText}`;
          }
        } else if (ans.type === 'rank') {
          displayValue = ans.order.map((item, i) => `${i + 1}. ${item}`).join(' · ');
        } else {
          displayValue = 'Skipped';
          skipped = true;
        }

        return (
          <div key={qi} className="flex flex-col gap-0.5">
            <p className="[font-size:var(--font-size-xs)] text-(--text-tertiary)">{q.label}</p>
            {qt === 'rank' && ans?.type === 'rank' ? (
              <ol className="flex flex-col gap-0.5 mt-0.5">
                {ans.order.map((item, i) => (
                  <li key={i} className="[font-size:var(--font-size-sm)] font-medium text-(--text-primary)">
                    {i + 1}. {item}
                  </li>
                ))}
              </ol>
            ) : (
              <p
                className={cn(
                  '[font-size:var(--font-size-sm)] font-medium',
                  skipped ? 'text-(--text-tertiary)' : 'text-(--text-primary)',
                )}
              >
                {displayValue}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── InlineCheckbox ───────────────────────────────────────────────────────────

interface InlineCheckboxProps {
  checked:       boolean;
  disableMotion: boolean;
}

/** Multi-select checkbox indicator. Visual pattern from checkbox-group.tsx. */
export function InlineCheckbox({ checked, disableMotion }: InlineCheckboxProps) {
  return (
    <span
      className={cn(
        'flex items-center justify-center shrink-0',
        'w-5 h-5 rounded-sm',
        checked
          ? 'bg-(--bg-interactive-primary-default)'
          : 'bg-(--bg-surface-base) shadow-(--shadow-border)',
      )}
    >
      {checked && (
        disableMotion ? (
          <Check className="h-3 w-3 text-(--text-inverse)" strokeWidth={3} />
        ) : (
          <motion.span
            className="inline-flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springs.interactive}
            style={{ willChange: 'transform' }}
          >
            <Check className="h-3 w-3 text-(--text-inverse)" strokeWidth={3} />
          </motion.span>
        )
      )}
    </span>
  );
}

// ─── useClarificationState ────────────────────────────────────────────────────

export interface UseClarificationOptions {
  questions:           ClarificationQuestion[];
  onSubmit?:           (answers: ClarificationAnswer[]) => void;
  autoAdvanceSingle?:  boolean;
}

export interface ClarificationState {
  currentIndex:    number;
  focusIndex:      number;
  answers:         ClarificationAnswer[];
  direction:       1 | -1;
  submitted:       boolean;
  pressedKey:      string | null;
  freeTextValue:   string;
  freeTextRef:     React.RefObject<HTMLInputElement | null>;
  isFirst:         boolean;
  isLast:          boolean;
  currentQ:        ClarificationQuestion;
  currentAnswer:   ClarificationAnswer;
  qt:              'single' | 'multi' | 'rank';
  lastOptionIdx:   number;
  showFreeText:    boolean;
  goTo:            (idx: number, dir: 1 | -1) => void;
  submit:          (overrideAnswers?: ClarificationAnswer[]) => void;
  selectSingle:    (oi: number) => void;
  toggleMulti:     (oi: number) => void;
  updateRank:      (newOrder: string[]) => void;
  advance:         () => void;
  updateFreeText:  (val: string) => void;
  cancelFreeText:  () => void;
  confirmFreeText: () => void;
  clearFocusIndex: () => void;
  handleKeyDown:   (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleKeyUp:     (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function useClarificationState({ questions, onSubmit, autoAdvanceSingle = false }: UseClarificationOptions): ClarificationState {
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [focusIndex,     setFocusIndex]     = useState(-1);
  const [answers,        setAnswers]        = useState<ClarificationAnswer[]>(
    () => questions.map(q =>
      qtype(q) === 'rank' ? { type: 'rank', order: [...(q as { items: string[] }).items] } : null
    )
  );
  const [direction,      setDirection]      = useState<1 | -1>(1);
  const [submitted,      setSubmitted]      = useState(false);
  const [pressedKey,     setPressedKey]     = useState<string | null>(null);
  const [freeTextValue,  setFreeTextValue]  = useState('');
  const freeTextRef = useRef<HTMLInputElement>(null);

  const isFirst       = currentIndex === 0;
  const isLast        = currentIndex === questions.length - 1;
  const currentQ      = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const qt            = qtype(currentQ);
  const lastOptionIdx = 'options' in currentQ ? currentQ.options.length - 1 : -1;
  const showFreeText  = 'freeText' in currentQ && currentQ.freeText === true &&
    isIndexSelected(currentAnswer, lastOptionIdx);

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goTo = useCallback((idx: number, dir: 1 | -1) => {
    setDirection(dir);
    setCurrentIndex(idx);
    const nextQ = questions[idx];
    const nextA = answers[idx];
    if (qtype(nextQ) !== 'rank') {
      if (nextA?.type === 'single')      setFocusIndex(nextA.index);
      else if (nextA?.type === 'multi')  setFocusIndex(nextA.indices[0] ?? -1);
      else                               setFocusIndex(-1);
    }
    const nextFreeText = (nextA?.type === 'single' || nextA?.type === 'multi')
      ? (nextA.freeText ?? '')
      : '';
    setFreeTextValue(nextFreeText);
  }, [answers, questions]);

  const submit = useCallback((overrideAnswers?: ClarificationAnswer[]) => {
    setSubmitted(true);
    onSubmit?.(overrideAnswers ?? answers);
  }, [answers, onSubmit]);

  // ─── Single-select ────────────────────────────────────────────────────────

  const selectSingle = useCallback((oi: number) => {
    setAnswers(prev => {
      const next     = [...prev];
      const existing = prev[currentIndex];
      const prevFreeText = existing?.type === 'single' ? (existing.freeText ?? '') : '';
      next[currentIndex] = { type: 'single', index: oi, freeText: prevFreeText || undefined };
      return next;
    });
    setFocusIndex(oi);
    if ('freeText' in currentQ && currentQ.freeText && oi === lastOptionIdx) {
      setTimeout(() => freeTextRef.current?.focus(), 50);
    }
  }, [currentIndex, currentQ, lastOptionIdx]);

  // ─── Multi-select ─────────────────────────────────────────────────────────

  const toggleMulti = useCallback((oi: number) => {
    setAnswers(prev => {
      const next         = [...prev];
      const existing     = prev[currentIndex];
      const prevIndices  = existing?.type === 'multi' ? existing.indices : [];
      const prevFreeText = existing?.type === 'multi' ? (existing.freeText ?? '') : '';
      const isOn         = prevIndices.includes(oi);
      const newIndices   = isOn
        ? prevIndices.filter(i => i !== oi)
        : [...prevIndices, oi].sort((a, b) => a - b);
      const newFreeText  = (isOn && oi === lastOptionIdx) ? '' : prevFreeText;
      next[currentIndex] = newIndices.length > 0
        ? { type: 'multi', indices: newIndices, freeText: newFreeText || undefined }
        : null;
      return next;
    });
    setFocusIndex(oi);
    const existing    = answers[currentIndex];
    const prevIndices = existing?.type === 'multi' ? existing.indices : [];
    const isCurrentlyOn = prevIndices.includes(oi);
    if (!isCurrentlyOn && 'freeText' in currentQ && currentQ.freeText && oi === lastOptionIdx) {
      setTimeout(() => freeTextRef.current?.focus(), 50);
    }
  }, [answers, currentIndex, currentQ, lastOptionIdx]);

  // ─── Rank ─────────────────────────────────────────────────────────────────

  const updateRank = useCallback((newOrder: string[]) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = { type: 'rank', order: newOrder };
      return next;
    });
  }, [currentIndex]);

  // ─── Free text ────────────────────────────────────────────────────────────

  const updateFreeText = useCallback((val: string) => {
    setFreeTextValue(val);
    setAnswers(prev => {
      const next     = [...prev];
      const existing = prev[currentIndex];
      if (existing?.type === 'single') next[currentIndex] = { ...existing, freeText: val || undefined };
      else if (existing?.type === 'multi') next[currentIndex] = { ...existing, freeText: val || undefined };
      return next;
    });
  }, [currentIndex]);

  const cancelFreeText = useCallback(() => {
    setAnswers(prev => {
      const next     = [...prev];
      const existing = prev[currentIndex];
      if (existing?.type === 'single') {
        next[currentIndex] = null;
      } else if (existing?.type === 'multi') {
        const newIndices   = existing.indices.filter(i => i !== lastOptionIdx);
        next[currentIndex] = newIndices.length > 0
          ? { type: 'multi', indices: newIndices }
          : null;
      }
      return next;
    });
    setFreeTextValue('');
  }, [currentIndex, lastOptionIdx]);

  const confirmFreeText = useCallback(() => {
    if (qt === 'single' && !isLast) {
      const next = [...answers];
      if (next[currentIndex] === null) next[currentIndex] = { type: 'single', index: lastOptionIdx };
      setAnswers(next);
      goTo(currentIndex + 1, 1);
    }
    freeTextRef.current?.blur();
  }, [qt, isLast, answers, currentIndex, lastOptionIdx, goTo]);

  // ─── Advance ──────────────────────────────────────────────────────────────

  const advance = useCallback(() => {
    if (isLast) return;
    setAnswers(prev => {
      const next = [...prev];
      if (next[currentIndex] === null) {
        if (qt === 'single')      next[currentIndex] = { type: 'single', index: -1 };
        else if (qt === 'multi')  next[currentIndex] = { type: 'multi', indices: [], freeText: undefined };
      }
      return next;
    });
    goTo(currentIndex + 1, 1);
  }, [isLast, currentIndex, qt, goTo]);

  // ─── Keyboard handlers ────────────────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (submitted) return;
    if (e.target instanceof HTMLInputElement) return;

    setPressedKey(e.key === 'Shift' ? 'Shift' : e.key);

    /** After single-select, advance/submit if autoAdvanceSingle is on and not freeText. */
    function autoAdvanceAfterSingle(selectedIndex: number) {
      if (!autoAdvanceSingle) return;
      const isFreeTextOption =
        'freeText' in currentQ && currentQ.freeText && selectedIndex === lastOptionIdx;
      if (isFreeTextOption) return;
      if (isLast) {
        const updated = [...answers];
        updated[currentIndex] = { type: 'single', index: selectedIndex };
        submit(updated);
      } else {
        advance();
      }
    }

    switch (e.key) {
      case 'ArrowUp':
        if (qt !== 'rank') {
          e.preventDefault();
          setFocusIndex(i => i === -1 ? lastOptionIdx : Math.max(0, i - 1));
        }
        break;
      case 'ArrowDown':
        if (qt !== 'rank') {
          e.preventDefault();
          const optLen = 'options' in currentQ ? currentQ.options.length : 0;
          setFocusIndex(i => i === -1 ? 0 : Math.min(optLen - 1, i + 1));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (e.shiftKey && isLast) {
          submit();
        } else if (focusIndex === -1) {
          // no keyboard focus active — ignore Enter for selection
        } else if (qt === 'single') {
          selectSingle(focusIndex);
          autoAdvanceAfterSingle(focusIndex);
        } else if (qt === 'multi') {
          toggleMulti(focusIndex);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (!isFirst) goTo(currentIndex - 1, -1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        advance();
        break;
      default: {
        const num    = parseInt(e.key, 10);
        const optLen = 'options' in currentQ ? currentQ.options.length : 0;
        if (num >= 1 && num <= optLen) {
          e.preventDefault();
          if (qt === 'single') {
            selectSingle(num - 1);
            autoAdvanceAfterSingle(num - 1);
          } else if (qt === 'multi') {
            toggleMulti(num - 1);
          }
        }
      }
    }
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.target instanceof HTMLInputElement) return;
    setPressedKey(null);
  }

  return {
    currentIndex, focusIndex, answers, direction, submitted, pressedKey,
    freeTextValue, freeTextRef,
    isFirst, isLast, currentQ, currentAnswer, qt, lastOptionIdx, showFreeText,
    goTo, submit, selectSingle, toggleMulti, updateRank, advance,
    updateFreeText, cancelFreeText, confirmFreeText,
    clearFocusIndex: () => setFocusIndex(-1),
    handleKeyDown, handleKeyUp,
  };
}
