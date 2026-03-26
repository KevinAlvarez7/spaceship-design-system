'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';
import { Button } from './button';
import { RadioGroup, RadioItem } from './radio-group';
import { CheckboxGroup, CheckboxItem } from './checkbox-group';
import { SortableList } from './sortable-list';
import { Tag } from './tag';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high';

export interface OptionMetadata {
  timeEstimate?: string;
  riskLevel?: RiskLevel;
}

/** A clarification option — either a plain string or an object with metadata. */
export type ClarificationOption = string | { label: string; meta?: OptionMetadata };

export type ClarificationSingleSelect = { type: 'single'; label: string; options: ClarificationOption[]; freeText?: boolean };
export type ClarificationMultiSelect  = { type: 'multi';  label: string; options: ClarificationOption[]; freeText?: boolean };
export type ClarificationRankPriorities = { type: 'rank'; label: string; items: string[] };
export type ClarificationQuestion =
  | ClarificationSingleSelect
  | ClarificationMultiSelect
  | ClarificationRankPriorities;
export type ClarificationAnswers = Record<number, string | string[]>;

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const clarificationCardVariants = cva(
  ['flex flex-col', 'w-full', 'min-w-(--sizing-chat-min)', 'max-w-(--sizing-chat-max)', 'font-sans', 'bg-(--bg-surface-base)', 'rounded-lg overflow-hidden'],
  {
    variants: {
      surface: {
        default:       '',
        'shadow-border': 'shadow-(--shadow-border)',
      },
    },
    defaultVariants: { surface: 'shadow-border' },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ClarificationCardProps
  extends VariantProps<typeof clarificationCardVariants> {
  questions: ClarificationQuestion[];
  onSubmit?: (answers: ClarificationAnswers) => void;
  onClose?: () => void;
  disableMotion?: boolean;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RISK_TAG_VARIANT: Record<RiskLevel, 'success' | 'warning' | 'error'> = {
  safe:   'success',
  low:    'success',
  medium: 'warning',
  high:   'error',
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Extracts the display label from a ClarificationOption (string or object). */
function getOptionLabel(opt: ClarificationOption): string {
  return typeof opt === 'string' ? opt : opt.label;
}

/** Renders inline metadata badges (time estimate + risk level) for rich options. */
function OptionMeta({ opt }: { opt: ClarificationOption }) {
  if (typeof opt === 'string' || !opt.meta) return null;
  const { timeEstimate, riskLevel } = opt.meta;
  return (
    <span className="flex items-center gap-1 shrink-0">
      {timeEstimate && (
        <Tag variant="neutral" size="sm">{timeEstimate}</Tag>
      )}
      {riskLevel && (
        <Tag variant={RISK_TAG_VARIANT[riskLevel]} size="sm">
          {riskLevel === 'safe' ? 'Safe' : riskLevel === 'low' ? 'Low risk' : riskLevel === 'medium' ? 'Medium risk' : 'High risk'}
        </Tag>
      )}
    </span>
  );
}

function getRankItems(
  answers: ClarificationAnswers,
  qIndex: number,
  question: ClarificationRankPriorities,
): string[] {
  const ans = answers[qIndex];
  return Array.isArray(ans) ? ans : question.items;
}

function hasAnswer(answers: ClarificationAnswers, qIndex: number): boolean {
  const ans = answers[qIndex];
  if (ans === undefined) return false;
  if (Array.isArray(ans)) return ans.length > 0;
  return ans.length > 0;
}

// ─── NumberBadge ──────────────────────────────────────────────────────────────

function NumberBadge({ n }: { n: number }) {
  return (
    <span
      className={cn(
        'flex items-center justify-center shrink-0',
        'w-6 h-6 rounded-md',
        'bg-(--bg-interactive-secondary-default) text-(--text-primary)',
        'group-hover/radio:bg-(--bg-interactive-secondary-hover)',
        'transition-colors duration-(--duration-fast)',
        '[font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)]',
      )}
    >
      {n}
    </span>
  );
}

// ─── ClarificationCard ────────────────────────────────────────────────────────

export function ClarificationCard({
  questions,
  onSubmit,
  onClose,
  disableMotion = false,
  surface,
  className,
}: ClarificationCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ClarificationAnswers>({});
  const [maxVisited, setMaxVisited] = useState(0);
  const [freeTextValue, setFreeTextValue] = useState('');

  const total = questions.length;
  const question = questions[currentIndex];
  const answered = hasAnswer(answers, currentIndex);

  // ── Answer setters ─────────────────────────────────────────────────────────

  function selectSingle(value: string) {
    const nextAnswers = { ...answers, [currentIndex]: value };
    setAnswers(nextAnswers);
    if (currentIndex < total - 1) {
      advance(1);
    } else {
      onSubmit?.(nextAnswers);
    }
  }

  function onMultiChange(next: string[]) {
    setAnswers(prev => ({ ...prev, [currentIndex]: next }));
  }

  function reorderRank(items: string[]) {
    setAnswers(prev => ({ ...prev, [currentIndex]: items }));
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  function advance(dir: 1 | -1) {
    const next = currentIndex + dir;
    setCurrentIndex(next);
    setFreeTextValue('');
    if (dir === 1) setMaxVisited(prev => Math.max(prev, next));
  }

  function handleSubmit() {
    if (currentIndex < total - 1) {
      advance(1);
    } else {
      onSubmit?.(answers);
    }
  }

  function handleSkip() {
    if (currentIndex < total - 1) {
      advance(1);
    } else {
      onSubmit?.(answers);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) advance(-1);
  }

  function handleNext() {
    if (currentIndex < maxVisited) advance(1);
  }

  // ── Question content ───────────────────────────────────────────────────────

  function renderQuestion() {
    if (question.type === 'single') {
      return (
        <RadioGroup
          value={(answers[currentIndex] as string | undefined) ?? ''}
          onChange={selectSingle}
          indicator="none"
          surface="default"
          className="rounded-none"
          disableMotion={disableMotion}
        >
          {question.options.map((option, i) => {
            const label = getOptionLabel(option);
            return (
              <RadioItem key={label} value={label}>
                <NumberBadge n={i + 1} />
                <span className="flex-1 [font-size:var(--font-size-sm)] text-(--text-primary)">
                  {label}
                </span>
                <OptionMeta opt={option} />
                <ArrowRight
                  className="h-4 w-4 text-(--text-tertiary) shrink-0 opacity-0 group-hover/radio:opacity-100 transition-opacity duration-(--duration-fast)"
                  strokeWidth={2}
                />
              </RadioItem>
            );
          })}
        </RadioGroup>
      );
    }

    if (question.type === 'multi') {
      const selected = (answers[currentIndex] as string[] | undefined) ?? [];
      const count = selected.length;
      return (
        <div className="flex flex-col">
          <CheckboxGroup
            value={selected}
            onChange={onMultiChange}
            surface="default"
            className="rounded-none"
            disableMotion={disableMotion}
          >
            {question.options.map(option => {
              const label = getOptionLabel(option);
              return (
                <CheckboxItem key={label} value={label}>
                  <span className="flex-1 [font-size:var(--font-size-sm)] text-(--text-primary)">
                    {label}
                  </span>
                  <OptionMeta opt={option} />
                </CheckboxItem>
              );
            })}
          </CheckboxGroup>
          {question.freeText && (
            <>
              <SeparatorPrimitive.Root className="mx-4 h-px bg-(--bg-surface-secondary)" />
              <div className="flex items-center gap-3 w-full px-4 py-2 rounded-lg">
                <input
                  type="text"
                  aria-label="Add your own option"
                  placeholder="Add your own..."
                  value={freeTextValue}
                  onChange={e => setFreeTextValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && freeTextValue.trim()) {
                      onMultiChange([...selected, freeTextValue.trim()]);
                      setFreeTextValue('');
                    }
                  }}
                  className={cn(
                    'flex-1 bg-(--bg-surface-secondary) text-(--text-primary)',
                    'rounded-lg px-3 py-1.5',
                    '[font-size:var(--font-size-sm)]',
                    'placeholder:text-(--text-tertiary)',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus)',
                  )}
                />
                <Button
                  variant="ghost"
                  size="icon-md"
                  icon={<ArrowRight strokeWidth={2.5} />}
                  onClick={() => {
                    if (freeTextValue.trim()) {
                      onMultiChange([...selected, freeTextValue.trim()]);
                      setFreeTextValue('');
                    }
                  }}
                  disableMotion={disableMotion}
                  className="w-6 h-6"
                />
              </div>
            </>
          )}
          <SeparatorPrimitive.Root className="h-px bg-(--bg-surface-tertiary)" />
          <div className="p-2">
            <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary)">
              {count === 0 ? 'None selected' : `${count} selected`}
            </span>
          </div>
        </div>
      );
    }

    if (question.type === 'rank') {
      const items = getRankItems(answers, currentIndex, question);
      return (
        <div className="flex flex-col">
          <SortableList
            items={items}
            onReorder={reorderRank}
            surface="default"
            className="rounded-none"
            renderItem={(item, index) => (
              <>
                <NumberBadge n={index + 1} />
                <span className="flex-1 [font-size:var(--font-size-sm)] text-(--text-primary)">
                  {item}
                </span>
              </>
            )}
          />
          <SeparatorPrimitive.Root className="h-px bg-(--bg-surface-tertiary)" />
          <div className="p-2">
            <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary)">
              Drag to re-order your priorities
            </span>
          </div>
        </div>
      );
    }

    return null;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={cn(clarificationCardVariants({ surface }), className)}>

      {/* Header */}
      <div className="flex items-center gap-2 p-3">
        <span className="flex-1 font-sans text-(length:--font-size-base) [font-weight:var(--font-weight-bold)] leading-(--line-height-base) text-(--text-primary)">
          {question.label}
        </span>

        {/* Close */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon-md"
            icon={<X strokeWidth={2.5} />}
            onClick={onClose}
            disableMotion={disableMotion} 
            className="w-6 h-6"
          />
        )}
      </div>

      {/* Question content — layout FLIP for height morphing between questions (B-tier) */}
      <motion.div
        layout
        transition={{ layout: disableMotion ? { duration: 0 } : springs.gentle }}
        className="relative overflow-hidden"
      >
        <div className="p-2">
          {renderQuestion()}
        </div>
      </motion.div>

      {/* Footer */}
      {question.type === 'single' && question.freeText ? (
        <div className="flex items-center gap-2 px-4 py-3">
          <input
            type="text"
            aria-label="Type your answer"
            placeholder="Type your answer..."
            value={freeTextValue}
            onChange={e => setFreeTextValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && freeTextValue.trim()) {
                selectSingle(freeTextValue.trim());
                setFreeTextValue('');
              }
            }}
            className={cn(
              'flex-1 bg-(--bg-surface-secondary) text-(--text-primary)',
              'rounded-lg px-3 py-2',
              '[font-size:var(--font-size-sm)]',
              'placeholder:text-(--text-tertiary)',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus)',
            )}
          />
          <Button
            variant={freeTextValue.trim() ? 'primary' : 'secondary'}
            size="icon-md"
            icon={<ArrowRight strokeWidth={2.5} />}
            onClick={() => {
              if (freeTextValue.trim()) {
                selectSingle(freeTextValue.trim());
                setFreeTextValue('');
              }
            }}
            disableMotion={disableMotion}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Pagination */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-md"
              icon={<ChevronLeft strokeWidth={2.5} />}
              onClick={handlePrev}
              disabled={currentIndex === 0}
              disableMotion={disableMotion}
              className="w-6 h-6"
            />

            <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary) min-w-[3rem] text-center tabular-nums">
              {currentIndex + 1} of {total}
            </span>

            <Button
              variant="ghost"
              size="icon-md"
              icon={<ChevronRight strokeWidth={2.5} />}
              onClick={handleNext}
              disabled={currentIndex >= maxVisited}
              disableMotion={disableMotion}
              className="w-6 h-6"
            />
          </div>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="md"
            onClick={handleSkip}
            disableMotion={disableMotion}
          >
            Skip
          </Button>
          <Button
            variant={answered ? 'primary' : 'secondary'}
            size="icon-md"
            icon={<ArrowRight strokeWidth={2.5} />}
            onClick={handleSubmit}
            disableMotion={disableMotion}
          />
        </div>
      )}
    </div>
  );
}
