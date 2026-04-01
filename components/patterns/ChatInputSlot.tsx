'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClarificationCard, ChatInputBox } from '@/components/ui';
import type {
  ClarificationQuestion,
  ClarificationAnswer,
  ChatInputBoxProps,
} from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatInputSlotProps {
  /** Which component to display. */
  mode: 'clarification' | 'input';

  /** Props forwarded to ClarificationCard when mode = 'clarification'. */
  clarification?: {
    questions: ClarificationQuestion[];
    onSubmit: (answers: ClarificationAnswer[]) => void;
    surface?: 'default' | 'shadow-border';
  };

  /** Props forwarded to ChatInputBox when mode = 'input'. */
  input?: ChatInputBoxProps;

  disableMotion?: boolean;
  className?: string;
}

// ─── ChatInputSlot ────────────────────────────────────────────────────────────

/**
 * Switches between ClarificationCard and ChatInputBox with a bottom-sheet
 * slide animation — each component slides up to enter and down to exit.
 * p-2 / -m-2 on the overflow container gives shadow-border room to render.
 */
export function ChatInputSlot({
  mode,
  clarification,
  input,
  disableMotion = false,
  className,
}: ChatInputSlotProps) {
  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={disableMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={disableMotion ? undefined : { opacity: 0, y: 16 }}
          transition={disableMotion ? { duration: 0 } : { duration: 0.15 }}
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
  );
}
