'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useMeasure from 'react-use-measure';
import { ClarificationCard, ChatInputBox } from '@/components/ui';
import type {
  ClarificationQuestion,
  ClarificationAnswers,
  ChatInputBoxProps,
} from '@/components/ui';
import { springs } from '@/tokens';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FooterSwitchProps {
  /** Which component to display in the footer slot. */
  mode: 'clarification' | 'input';

  /** Props forwarded to ClarificationCard when mode = 'clarification'. */
  clarification?: {
    questions: ClarificationQuestion[];
    onSubmit: (answers: ClarificationAnswers) => void;
    surface?: 'default' | 'shadow-border';
  };

  /** Props forwarded to ChatInputBox when mode = 'input'. */
  input?: ChatInputBoxProps;

  disableMotion?: boolean;
  className?: string;
}

// ─── FooterSwitch ─────────────────────────────────────────────────────────────

/**
 * Animates between ClarificationCard and ChatInputBox without overflow-hidden,
 * so box-shadows on both components remain fully visible throughout the
 * transition. Height is driven by useMeasure + spring; content crossfades via
 * AnimatePresence with popLayout so both enter/exit run simultaneously.
 */
export function FooterSwitch({
  mode,
  clarification,
  input,
  disableMotion = false,
  className,
}: FooterSwitchProps) {
  const [contentRef, { height: contentHeight }] = useMeasure();

  return (
    // Intentionally NO overflow-hidden — box-shadows on child components are
    // never clipped during the height spring animation.
    <motion.div
      animate={{ height: contentHeight || 'auto' }}
      initial={false}
      transition={disableMotion ? { duration: 0 } : springs.gentle}
      className={cn('relative', className)}
    >
      <div ref={contentRef} className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={mode}
            initial={disableMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={disableMotion ? undefined : { opacity: 0, scale: 0.97 }}
            transition={disableMotion ? { duration: 0 } : springs.interactive}
            style={{ willChange: 'transform' }}
          >
            {mode === 'clarification' && clarification ? (
              <ClarificationCard
                questions={clarification.questions}
                onSubmit={clarification.onSubmit}
                surface={clarification.surface}
                disableMotion={disableMotion}
              />
            ) : input ? (
              <ChatInputBox {...input} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
