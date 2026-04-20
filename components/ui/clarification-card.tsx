"use client";

import { useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { useDragResize } from './use-drag-resize';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { SortableList } from './sortable-list';
import {
  clarificationCardVariants,
  type ClarificationCardBaseProps,
  type ClarificationQuestion,
  type ClarificationAnswer,
  isIndexSelected,
  hasAnswer,
  statusText,
  optionLabel,
  optionIcon,
  SummaryView,
  InlineCheckbox,
  useClarificationState,
} from './clarification-card-shared';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClarificationCardProps extends ClarificationCardBaseProps {
  questions:        ClarificationQuestion[];
  onSubmit?:        (answers: ClarificationAnswer[]) => void;
  onClose?:         () => void;
  disableMotion?:   boolean;
  /** Custom label for the submit button. Defaults to "Submit". */
  submitLabel?:     string;
  className?:       string;
}

// ━━━ ClarificationCard ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ClarificationCard({
  questions,
  onSubmit,
  onClose,
  disableMotion = false,
  submitLabel = 'Submit',
  surface,
  weight,
  className,
}: ClarificationCardProps) {
  const {
    currentIndex, focusIndex, answers, submitted,
    freeTextValue, freeTextRef,
    isFirst, isLast, currentQ, currentAnswer, qt, lastOptionIdx, showFreeText,
    goTo, submit, selectSingle, toggleMulti, updateRank, advance,
    updateFreeText, cancelFreeText, confirmFreeText,
    clearFocusIndex, handleKeyDown, handleKeyUp,
  } = useClarificationState({ questions, onSubmit });

  const { cardRef, cardHeight, handleProps, animateToContent } = useDragResize({
    enabled: !submitted,
    disableMotion,
  });

  // Animate height when content changes (question navigation, submit).
  // Runs before paint so the temporary height: auto measurement is invisible.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { animateToContent(); }, [currentIndex, submitted]);

  return (
    <motion.div
      ref={cardRef}
      role="group"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={cn(clarificationCardVariants({ surface, weight }), 'relative', className)}
      style={{ height: cardHeight, willChange: 'height' }}
    >
      {/* Dismiss button — only when onClose provided and card is interactive */}
      {onClose && !submitted && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onClose}
          className={cn(
            'absolute top-2 right-2 z-10 p-1 rounded',
            'text-(--text-tertiary) hover:text-(--text-primary)',
            'hover:bg-(--bg-surface-secondary)',
            'transition-colors duration-(--duration-fast)',
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {/* Drag handle */}
      {!submitted && (
        <div
          {...handleProps}
          className="flex justify-center py-2 cursor-grab touch-none select-none"
        >
          <div className="w-8 h-1 rounded-full bg-(--bg-surface-tertiary)" />
        </div>
      )}

      {/* Content: question flow or summary */}
      {submitted ? (
        <SummaryView questions={questions} answers={answers} />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3 px-4">

          {/* Question group — pagination + title */}
          <div className="flex flex-col gap-3">
            {questions.length > 1 && (
              <p className="[font-size:var(--font-size-sm)] font-semibold text-(--text-tertiary)">
                Question {currentIndex + 1} of {questions.length}
              </p>
            )}
            <h5
              className="[font-size:var(--font-size-base)] font-bold text-(--text-primary)"
              id={`cc-q-${currentIndex}`}
            >
              {currentQ.label}
            </h5>
          </div>

          {/* Answer group — options/rank + status footer */}
          <div className="flex flex-col gap-3">

            {/* Option list — single or multi */}
            {qt !== 'rank' && 'options' in currentQ && (
              <div
                role="listbox"
                aria-multiselectable={qt === 'multi'}
                aria-labelledby={`cc-q-${currentIndex}`}
                aria-activedescendant={`cc-opt-${currentIndex}-${focusIndex}`}
                className="flex flex-col"
              >
                {currentQ.options.map((opt, oi) => {
                  const isFocused        = focusIndex === oi;
                  const isSelected       = isIndexSelected(currentAnswer, oi);
                  const isLastOpt        = oi === lastOptionIdx;
                  const isInlineFreeText = showFreeText && isLastOpt;
                  const icon             = optionIcon(opt);
                  const label            = optionLabel(opt);

                  const rowClass = isFocused
                    ? 'bg-(--bg-surface-primary) text-(--text-primary)'
                    : isSelected
                      ? 'text-(--text-primary)'
                      : 'text-(--text-secondary)';

                  return (
                    <div
                      key={oi}
                      id={`cc-opt-${currentIndex}-${oi}`}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => clearFocusIndex()}
                      onClick={() => {
                        if (isInlineFreeText) { freeTextRef.current?.focus(); return; }
                        if (qt === 'single') selectSingle(oi);
                        else toggleMulti(oi);
                      }}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-md cursor-pointer',
                        'hover:bg-(--bg-surface-primary) hover:text-(--text-primary)',
                        '[transition:background-color_80ms_ease,color_80ms_ease]',
                        rowClass,
                      )}
                    >
                      {/* Left indicator: icon if provided, otherwise number badge */}
                      {icon ? (
                        <span
                          aria-hidden="true"
                          className="flex items-center justify-center shrink-0 w-6 h-6 [&>svg]:h-4 [&>svg]:w-4"
                        >
                          {icon}
                        </span>
                      ) : (
                        <span
                          aria-hidden="true"
                          className={cn(
                            'flex items-center justify-center shrink-0 w-6 h-6 rounded',
                            'bg-(--bg-surface-secondary)',
                            '[font-size:var(--font-size-xs)] font-semibold',
                            'text-(--text-secondary)',
                          )}
                        >
                          {String(oi + 1)}
                        </span>
                      )}

                      {isInlineFreeText ? (
                        <input
                          ref={freeTextRef}
                          type="text"
                          value={freeTextValue}
                          placeholder="Type another option"
                          onChange={e => updateFreeText(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => {
                            if (e.key === 'Enter')  { e.preventDefault(); confirmFreeText(); }
                            if (e.key === 'Escape') { e.preventDefault(); cancelFreeText(); }
                          }}
                          className={cn(
                            'flex-1 min-w-0 bg-transparent outline-none',
                            '[font-size:var(--font-size-sm)]',
                            'text-(--text-primary) placeholder:text-(--text-placeholder)',
                          )}
                        />
                      ) : isLastOpt && 'freeText' in currentQ && currentQ.freeText ? (
                        <span className="flex-1 [font-size:var(--font-size-sm)] leading-snug text-(--text-placeholder)">
                          Type another option
                        </span>
                      ) : (
                        <span className="flex-1 [font-size:var(--font-size-sm)] leading-snug">
                          {label}
                        </span>
                      )}

                      {/* Right indicator */}
                      {qt === 'multi' && (
                        <InlineCheckbox checked={isSelected} disableMotion={disableMotion} />
                      )}
                      {qt === 'single' && (isSelected || isInlineFreeText) && (
                        <Check
                          className="h-4 w-4 text-(--text-tertiary) shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rank — SortableList */}
            {qt === 'rank' && (
              <SortableList
                items={currentAnswer?.type === 'rank' ? currentAnswer.order : (currentQ as { items: string[] }).items}
                onReorder={updateRank}
                surface="default"
                dividers={false}
              />
            )}

            {/* Status footer */}
            <div className="p-2 border-t border-(--bg-surface-tertiary)">
              <p className="[font-size:var(--font-size-xs)] font-semibold text-(--text-placeholder)">
                {statusText(qt, currentAnswer)}
              </p>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Button footer */}
      {!submitted && (
        <div className="flex items-center justify-between p-3 gap-2">
          {/* Back */}
          <div>
            {!isFirst && (
              <Button
                variant="secondary"
                surface="flat"
                size="sm"
                leadingIcon={<ArrowLeft />}
                disableMotion={disableMotion}
                onClick={() => goTo(currentIndex - 1, -1)}
              >
                Back
              </Button>
            )}
          </div>

          {/* Skip + Next / Submit */}
          <div className="flex items-center gap-2">
            {isLast ? (
              <Button
                variant="primary"
                size="sm"
                disableMotion={disableMotion}
                onClick={() => submit()}
              >
                {submitLabel}
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  surface="flat"
                  size="sm"
                  disableMotion={disableMotion}
                  onClick={advance}
                >
                  Skip
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  trailingIcon={<ArrowRight />}
                  disabled={!hasAnswer(currentAnswer)}
                  disableMotion={disableMotion}
                  onClick={advance}
                >
                  Next
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
