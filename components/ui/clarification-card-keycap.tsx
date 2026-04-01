"use client";

import React, { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Keycap, KeyCombo } from './keycap';
import { SortableList } from './sortable-list';
import {
  clarificationCardVariants,
  type ClarificationCardBaseProps,
  type ClarificationQuestion,
  type ClarificationAnswer,
  SLIDE_EASE,
  optionRowClass,
  isIndexSelected,
  hasAnswer,
  statusText,
  ProgressBar,
  SummaryView,
  InlineCheckbox,
  useClarificationState,
} from './clarification-card-shared';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClarificationCardKeycapProps extends ClarificationCardBaseProps {
  questions:      ClarificationQuestion[];
  onSubmit?:      (answers: ClarificationAnswer[]) => void;
  onClose?:       () => void;
  disableMotion?: boolean;
  className?:     string;
}

// ─── HintGroup ───────────────────────────────────────────────────────────────

function HintGroup({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn('flex items-center gap-1', className)}>{children}</span>;
}

// ─── HintLabel ───────────────────────────────────────────────────────────────

function HintLabel({ children }: { children: ReactNode }) {
  return (
    <span className="[font-size:var(--font-size-2xs)] text-(--text-tertiary) select-none">
      {children}
    </span>
  );
}

// ─── HintBar ─────────────────────────────────────────────────────────────────

interface HintBarProps {
  isFirst:      boolean;
  isLast:       boolean;
  hasAns:       boolean;
  pressedKey:   string | null;
  questionType: 'single' | 'multi' | 'rank';
}

function HintBar({ isFirst, isLast, hasAns, pressedKey, questionType }: HintBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4 border-t border-(--bg-surface-secondary)">
      {/* Left cluster — navigate + select/toggle */}
      <div className="flex items-center gap-3">
        {questionType !== 'rank' ? (
          <>
            <HintGroup>
              <KeyCombo separator="">
                <Keycap pressed={pressedKey === 'ArrowUp'}>↑</Keycap>
                <Keycap pressed={pressedKey === 'ArrowDown'}>↓</Keycap>
              </KeyCombo>
              <HintLabel>navigate</HintLabel>
            </HintGroup>
            <HintGroup>
              <Keycap pressed={pressedKey === 'Enter'}>↵</Keycap>
              <HintLabel>{questionType === 'multi' ? 'toggle' : 'select'}</HintLabel>
            </HintGroup>
          </>
        ) : (
          <HintGroup>
            <HintLabel>drag to reorder</HintLabel>
          </HintGroup>
        )}
      </div>

      {/* Right cluster — back + next/skip or submit */}
      <div className="flex items-center gap-3">
        <HintGroup className={cn(isFirst && 'opacity-30')}>
          <Keycap pressed={pressedKey === 'ArrowLeft'}>←</Keycap>
          <HintLabel>back</HintLabel>
        </HintGroup>

        {!isLast ? (
          <HintGroup>
            <Keycap pressed={pressedKey === 'ArrowRight'}>→</Keycap>
            <HintLabel>{hasAns ? 'next' : 'skip'}</HintLabel>
          </HintGroup>
        ) : (
          <HintGroup>
            <KeyCombo separator="">
              <Keycap pressed={pressedKey === 'Shift'}>⇧</Keycap>
              <Keycap pressed={pressedKey === 'Enter'}>↵</Keycap>
            </KeyCombo>
            <HintLabel>submit</HintLabel>
          </HintGroup>
        )}
      </div>
    </div>
  );
}

// ─── Slide variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir * 16 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir * -16 }),
};

// ━━━ ClarificationCardKeycap ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ClarificationCardKeycap({
  questions,
  onSubmit,
  disableMotion = false,
  surface,
  className,
}: ClarificationCardKeycapProps) {
  const {
    currentIndex, focusIndex, answers, direction, submitted, pressedKey,
    freeTextValue, freeTextRef,
    isFirst, isLast, currentQ, currentAnswer, qt, lastOptionIdx, showFreeText,
    goTo, selectSingle, toggleMulti, updateRank,
    updateFreeText, cancelFreeText, confirmFreeText,
    clearFocusIndex, handleKeyDown, handleKeyUp,
  } = useClarificationState({ questions, onSubmit });

  return (
    <div
      role="group"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={cn(clarificationCardVariants({ surface }), className)}
    >
      {/* Progress bar */}
      {!submitted && (
        <ProgressBar
          total={questions.length}
          current={currentIndex}
          onJumpTo={i => goTo(i, i > currentIndex ? 1 : -1)}
        />
      )}

      {/* Content: question flow or summary */}
      {submitted ? (
        <SummaryView questions={questions} answers={answers} />
      ) : (
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={disableMotion ? undefined : slideVariants}
              initial={disableMotion ? false : 'enter'}
              animate="center"
              exit={disableMotion ? undefined : 'exit'}
              transition={disableMotion ? { duration: 0 } : { duration: 0.18, ease: SLIDE_EASE }}
              className="flex flex-col gap-2 px-4 py-4"
            >
              {/* Pagination */}
              {questions.length > 1 && (
                <p className="[font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)] text-(--text-tertiary)">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              )}

              {/* Question label */}
              <p
                className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-primary)"
                id={`cck-q-${currentIndex}`}
              >
                {currentQ.label}
              </p>

              {/* Status text */}
              {(() => {
                const st = statusText(qt, currentAnswer);
                return st ? (
                  <p className="[font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)] text-(--text-placeholder)">
                    {st}
                  </p>
                ) : null;
              })()}

              {/* Option list — single or multi */}
              {qt !== 'rank' && 'options' in currentQ && (
                <div
                  role="listbox"
                  aria-multiselectable={qt === 'multi'}
                  aria-labelledby={`cck-q-${currentIndex}`}
                  aria-activedescendant={`cck-opt-${currentIndex}-${focusIndex}`}
                  className="flex flex-col"
                >
                  {currentQ.options.map((opt, oi) => {
                    const isFocused        = focusIndex === oi;
                    const isSelected       = isIndexSelected(currentAnswer, oi);
                    const isLastOpt        = oi === lastOptionIdx;
                    const isInlineFreeText = showFreeText && isLastOpt;

                    return (
                      <div
                        key={oi}
                        id={`cck-opt-${currentIndex}-${oi}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => clearFocusIndex()}
                        onClick={() => {
                          if (isInlineFreeText) {
                            freeTextRef.current?.focus();
                            return;
                          }
                          if (qt === 'single') selectSingle(oi);
                          else toggleMulti(oi);
                        }}
                        className={cn(
                          'flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer',
                          '[transition:background-color_80ms_ease,color_80ms_ease]',
                          optionRowClass(isFocused, isSelected),
                        )}
                      >
                        <Keycap
                          variant="default"
                          pressed={pressedKey === String(oi + 1)}
                          disableMotion={disableMotion}
                          aria-hidden="true"
                        >
                          {String(oi + 1)}
                        </Keycap>

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
                              '[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-medium)]',
                              'text-(--text-primary) placeholder:text-(--text-placeholder)',
                            )}
                          />
                        ) : isLastOpt && 'freeText' in currentQ && currentQ.freeText ? (
                          <span className="flex-1 [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-medium)] leading-none text-(--text-placeholder)">
                            Type another option
                          </span>
                        ) : (
                          <span className="flex-1 [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-medium)] leading-none">
                            {opt}
                          </span>
                        )}

                        {/* Right indicator */}
                        {qt === 'multi' && (
                          <InlineCheckbox checked={isSelected} disableMotion={disableMotion} />
                        )}
                        {qt === 'single' && (isSelected || isInlineFreeText) && (
                          <CornerDownLeft
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
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Hint bar */}
      {!submitted && (
        <HintBar
          isFirst={isFirst}
          isLast={isLast}
          hasAns={hasAnswer(currentAnswer)}
          pressedKey={pressedKey}
          questionType={qt}
        />
      )}
    </div>
  );
}
