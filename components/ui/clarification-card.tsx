'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
  Check,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClarificationSingleSelect = { type: 'single'; label: string; options: string[] };
export type ClarificationMultiSelect  = { type: 'multi';  label: string; options: string[] };
export type ClarificationRankPriorities = { type: 'rank'; label: string; items: string[] };
export type ClarificationQuestion =
  | ClarificationSingleSelect
  | ClarificationMultiSelect
  | ClarificationRankPriorities;
export type ClarificationAnswers = Record<number, string | string[]>;

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const clarificationCardVariants = cva(
  ['flex flex-col', 'bg-(--bg-surface-base)', 'rounded-xl overflow-hidden'],
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

// ─── Internal helpers ─────────────────────────────────────────────────────────

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
        'bg-(--bg-interactive-primary-default) text-(--text-inverse)',
        '[font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)]',
      )}
    >
      {n}
    </span>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Checkbox({ checked }: { checked: boolean }) {
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
        <Check
          className="h-3 w-3 text-(--text-inverse)"
          strokeWidth={3}
        />
      )}
    </span>
  );
}

// ─── Row divider ──────────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px bg-(--bg-surface-tertiary)" />;
}

// ─── SingleSelect content ─────────────────────────────────────────────────────

function SingleSelectContent({
  question,
  qIndex,
  answers,
  onSelect,
}: {
  question: ClarificationSingleSelect;
  qIndex: number;
  answers: ClarificationAnswers;
  onSelect: (value: string) => void;
}) {
  const selected = answers[qIndex] as string | undefined;

  return (
    <div className="flex flex-col">
      {question.options.map((option, i) => {
        const isSelected = selected === option;
        return (
          <div key={option}>
            {i > 0 && <Divider />}
            <button
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-3 text-left',
                'transition-colors duration-(--duration-fast) ease-(--ease-in-out)',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)',
                isSelected
                  ? 'bg-(--bg-surface-secondary)'
                  : 'hover:bg-(--bg-surface-secondary)',
              )}
            >
              <NumberBadge n={i + 1} />
              <span className="flex-1 [font-size:var(--font-size-sm)] text-(--text-primary)">
                {option}
              </span>
              {isSelected && (
                <ArrowRight className="h-4 w-4 text-(--text-tertiary) shrink-0" strokeWidth={2} />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── MultiSelect content ──────────────────────────────────────────────────────

function MultiSelectContent({
  question,
  qIndex,
  answers,
  onToggle,
}: {
  question: ClarificationMultiSelect;
  qIndex: number;
  answers: ClarificationAnswers;
  onToggle: (value: string) => void;
}) {
  const selected = (answers[qIndex] as string[] | undefined) ?? [];
  const count = selected.length;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        {question.options.map((option, i) => {
          const isSelected = selected.includes(option);
          return (
            <div key={option}>
              {i > 0 && <Divider />}
              <button
                type="button"
                onClick={() => onToggle(option)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3 text-left',
                  'transition-colors duration-(--duration-fast) ease-(--ease-in-out)',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)',
                  isSelected
                    ? 'bg-(--bg-surface-secondary)'
                    : 'hover:bg-(--bg-surface-secondary)',
                )}
              >
                <Checkbox checked={isSelected} />
                <span className="flex-1 [font-size:var(--font-size-sm)] text-(--text-primary)">
                  {option}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <Divider />
      <div className="px-4 py-2">
        <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary)">
          {count === 0 ? 'None selected' : `${count} selected`}
        </span>
      </div>
    </div>
  );
}

// ─── RankPriorities content ───────────────────────────────────────────────────

function RankPrioritiesContent({
  question,
  qIndex,
  answers,
  onReorder,
}: {
  question: ClarificationRankPriorities;
  qIndex: number;
  answers: ClarificationAnswers;
  onReorder: (items: string[]) => void;
}) {
  const items = getRankItems(answers, qIndex, question);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // Keep a ref so handleDrop can read the current dragIndex without stale closure
  const dragIndexRef = useRef<number | null>(null);

  function handleDragStart(i: number) {
    dragIndexRef.current = i;
    setDragIndex(i);
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setDragOverIndex(i);
  }

  function handleDrop(toIndex: number) {
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === toIndex) return;
    const next = [...items];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, removed);
    onReorder(next);
    dragIndexRef.current = null;
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        {items.map((item, i) => (
          <div key={item}>
            {i > 0 && <Divider />}
            <div
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-3',
                'transition-colors duration-(--duration-fast) ease-(--ease-in-out)',
                'cursor-grab active:cursor-grabbing',
                dragOverIndex === i && dragIndex !== i
                  ? 'bg-(--bg-surface-secondary)'
                  : 'hover:bg-(--bg-surface-secondary)',
              )}
            >
              <NumberBadge n={i + 1} />
              <span className="flex-1 [font-size:var(--font-size-sm)] text-(--text-primary)">
                {item}
              </span>
              <GripVertical className="h-4 w-4 text-(--text-tertiary) shrink-0" strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>
      <Divider />
      <div className="px-4 py-2">
        <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary)">
          Drag to re-order your priorities
        </span>
      </div>
    </div>
  );
}

// ─── Collapsed summary ────────────────────────────────────────────────────────

function CollapsedSummary({
  questions,
  answers,
  disableMotion,
}: {
  questions: ClarificationQuestion[];
  answers: ClarificationAnswers;
  disableMotion: boolean;
}) {
  const content = (
    <div className="flex flex-col gap-3 px-4 py-4">
      {questions.map((q, i) => {
        const ans = answers[i];
        const displayValue =
          ans === undefined
            ? '(skipped)'
            : Array.isArray(ans)
            ? ans.join(', ')
            : ans;
        return (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary)">
              {q.label}
            </span>
            <span className="[font-size:var(--font-size-sm)] text-(--text-primary)">
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );

  if (disableMotion) return content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springs.interactive}
      style={{ willChange: 'transform' }}
    >
      {content}
    </motion.div>
  );
}

// ─── SubmitButton ─────────────────────────────────────────────────────────────

function SubmitButton({
  answered,
  disableMotion,
  onClick,
}: {
  answered: boolean;
  disableMotion: boolean;
  onClick: () => void;
}) {
  const classes = cn(
    'flex items-center justify-center',
    'w-8 h-8 rounded-full shrink-0',
    'transition-colors duration-(--duration-fast) ease-(--ease-in-out)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus)',
    'cursor-pointer',
    answered
      ? 'bg-(--bg-interactive-primary-default)'
      : 'bg-(--bg-surface-tertiary)',
  );

  const icon = (
    <ArrowRight
      className={cn(
        'h-4 w-4',
        answered ? 'text-(--text-inverse)' : 'text-(--text-tertiary)',
      )}
      strokeWidth={2.5}
    />
  );

  if (disableMotion) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {icon}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      className={classes}
      onClick={onClick}
      style={{ willChange: 'transform' }}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={springs.interactive}
    >
      {icon}
    </motion.button>
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
  const [submitted, setSubmitted] = useState(false);
  const [maxVisited, setMaxVisited] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const total = questions.length;
  const question = questions[currentIndex];
  const answered = hasAnswer(answers, currentIndex);

  // ── Answer setters ─────────────────────────────────────────────────────────

  function selectSingle(value: string) {
    setAnswers(prev => ({ ...prev, [currentIndex]: value }));
  }

  function toggleMulti(value: string) {
    const current = (answers[currentIndex] as string[] | undefined) ?? [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setAnswers(prev => ({ ...prev, [currentIndex]: next }));
  }

  function reorderRank(items: string[]) {
    setAnswers(prev => ({ ...prev, [currentIndex]: items }));
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  function advance(dir: 1 | -1) {
    setDirection(dir);
    const next = currentIndex + dir;
    setCurrentIndex(next);
    if (dir === 1) setMaxVisited(prev => Math.max(prev, next));
  }

  function handleSubmit() {
    if (currentIndex < total - 1) {
      advance(1);
    } else {
      setSubmitted(true);
      onSubmit?.(answers);
    }
  }

  function handleSkip() {
    if (currentIndex < total - 1) {
      advance(1);
    } else {
      setSubmitted(true);
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
        <SingleSelectContent
          question={question}
          qIndex={currentIndex}
          answers={answers}
          onSelect={selectSingle}
        />
      );
    }
    if (question.type === 'multi') {
      return (
        <MultiSelectContent
          question={question}
          qIndex={currentIndex}
          answers={answers}
          onToggle={toggleMulti}
        />
      );
    }
    if (question.type === 'rank') {
      return (
        <RankPrioritiesContent
          question={question}
          qIndex={currentIndex}
          answers={answers}
          onReorder={reorderRank}
        />
      );
    }
    return null;
  }

  // ── Submitted state ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className={cn(clarificationCardVariants({ surface }), className)}>
        <CollapsedSummary
          questions={questions}
          answers={answers}
          disableMotion={disableMotion}
        />
      </div>
    );
  }

  // ── Motion variants ────────────────────────────────────────────────────────

  const slideVariants = {
    enter:  (dir: number) => ({ opacity: 0, x: dir * 16 }),
    center:                  { opacity: 1, x: 0 },
    exit:   (dir: number) => ({ opacity: 0, x: dir * -16 }),
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={cn(clarificationCardVariants({ surface }), className)}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="flex-1 [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-primary) leading-tight">
          {question.label}
        </span>

        {/* Pagination */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded-md',
              'transition-colors duration-(--duration-fast)',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus)',
              currentIndex === 0
                ? 'text-(--text-tertiary) opacity-40 cursor-not-allowed'
                : 'text-(--text-secondary) hover:bg-(--bg-surface-secondary) cursor-pointer',
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>

          <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary) min-w-[3rem] text-center tabular-nums">
            {currentIndex + 1} of {total}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= maxVisited}
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded-md',
              'transition-colors duration-(--duration-fast)',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus)',
              currentIndex >= maxVisited
                ? 'text-(--text-tertiary) opacity-40 cursor-not-allowed'
                : 'text-(--text-secondary) hover:bg-(--bg-surface-secondary) cursor-pointer',
            )}
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Close */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded-md shrink-0',
              'text-(--text-tertiary) hover:bg-(--bg-surface-secondary)',
              'transition-colors duration-(--duration-fast)',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus)',
              'cursor-pointer',
            )}
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Header divider */}
      <Divider />

      {/* Question content — animated */}
      <div className="relative overflow-hidden">
        {disableMotion ? (
          renderQuestion()
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={springs.interactive}
            >
              {renderQuestion()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer divider */}
      {question.type !== 'multi' && question.type !== 'rank' && <Divider />}

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleSkip}
          className={cn(
            '[font-size:var(--font-size-sm)] text-(--text-tertiary)',
            'hover:text-(--text-secondary)',
            'transition-colors duration-(--duration-fast)',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus) rounded-sm',
            'cursor-pointer',
          )}
        >
          Skip
        </button>
        <SubmitButton
          answered={answered}
          disableMotion={disableMotion}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
