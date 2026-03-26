'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EditableTitle } from '@/components/patterns/EditableTitle';
import { ChatInputBox, ClarificationCard, ApprovalCard } from '@/components/ui';
import type { ChatInputBoxProps, ClarificationQuestion, ClarificationAnswers, ApprovalPlan } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  children: React.ReactNode;
  // Header
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  onMenuClick?: () => void;
  // Layout
  className?: string;
  disableMotion?: boolean;

  /** ChatInputBox props. When provided, renders a ChatInputBox in the footer. */
  input?: ChatInputBoxProps;

  /** When provided, replaces ChatInputBox with ClarificationCard. */
  clarification?: {
    questions: ClarificationQuestion[];
    onSubmit: (answers: ClarificationAnswers) => void;
    surface?: 'default' | 'shadow-border';
  };

  /**
   * When provided, shows an ApprovalCard as a bottom-sheet overlay on top of
   * the chat thread. The normal footer (input / clarification) is hidden while
   * the overlay is active.
   */
  approval?: {
    plan: ApprovalPlan;
    onApprove: () => void;
    onReject: () => void;
    surface?: 'default' | 'shadow-border';
  };

  /** Extra content rendered above the footer input/card (e.g., TaskList). */
  footerAddon?: React.ReactNode;
}

export function ChatPanel({
  children,
  title,
  onTitleChange,
  onMenuClick,
  className,
  disableMotion = false,
  input,
  clarification,
  approval,
  footerAddon,
}: ChatPanelProps) {
  const hasFooter = !!(input || clarification || footerAddon);
  const footerKey = clarification ? 'clarification' : input ? 'input' : 'empty';

  return (
    <div className={cn('relative flex flex-col min-h-0 flex-1 min-w-(--sizing-chat-min) max-w-(--sizing-chat-max) p-4', className)}>
      {title !== undefined && (
        <div className="shrink-0">
          <EditableTitle
            title={title}
            onTitleChange={onTitleChange}
            onMenuClick={onMenuClick ?? (() => {})}
          />
        </div>
      )}
      <div className="flex flex-col flex-1 min-h-0">
        {children}
      </div>
      {hasFooter && !approval && (
        <div className="shrink-0">
          {footerAddon}

          {/* Bottom-sheet container — each footer component slides up to enter, down to exit */}
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={footerKey}
                initial={disableMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={disableMotion ? undefined : { opacity: 0, y: 16 }}
                transition={disableMotion ? { duration: 0 } : { duration: 0.15 }}
              >
                {clarification ? (
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
        </div>
      )}

      {/* Approval overlay — bottom-sheet that covers the chat thread */}
      <AnimatePresence>
        {approval && (
          <motion.div
            className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end"
            initial={disableMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={disableMotion ? undefined : { opacity: 0, y: 24 }}
            transition={disableMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
          >
            {/* Gradient fade — softens the chat content behind the overlay */}
            <div
              className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-linear-to-t from-(--bg-surface-base) to-transparent"
              aria-hidden
            />
            <div className="relative">
              <ApprovalCard
                plan={approval.plan}
                onApprove={approval.onApprove}
                onReject={approval.onReject}
                surface={approval.surface}
                disableMotion={disableMotion}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
