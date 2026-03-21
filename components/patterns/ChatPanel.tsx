'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useMeasure from 'react-use-measure';
import { EditableTitle } from '@/components/patterns/EditableTitle';
import { ChatInputBox, ClarificationCard } from '@/components/ui';
import type { ChatInputBoxProps, ClarificationQuestion, ClarificationAnswers } from '@/components/ui';
import { springs } from '@/tokens';
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
  footerAddon,
}: ChatPanelProps) {
  const [footerRef, { height: footerHeight }] = useMeasure();
  const hasFooter = !!(input || clarification || footerAddon);
  const footerKey = clarification ? 'clarification' : input ? 'input' : 'empty';

  return (
    <div className={cn('flex flex-col min-h-0 flex-1 min-w-(--sizing-chat-min) max-w-(--sizing-chat-max) p-4', className)}>
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
      {hasFooter && (
        <div className="shrink-0">
          {footerAddon}

          {/* Height-morphing container — animates between ClarificationCard and ChatInputBox heights */}
          <motion.div
            animate={{ height: footerHeight || 'auto' }}
            initial={false}
            transition={disableMotion ? { duration: 0 } : springs.gentle}
            className="overflow-hidden"
          >
            <div ref={footerRef} className="relative">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={footerKey}
                  initial={disableMotion ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={disableMotion ? undefined : { opacity: 0, scale: 0.97 }}
                  transition={disableMotion ? { duration: 0 } : springs.interactive}
                  style={{ willChange: 'transform' }}
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
          </motion.div>
        </div>
      )}
    </div>
  );
}
