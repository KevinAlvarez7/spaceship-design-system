'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { EditableTitle } from '@/components/patterns/EditableTitle';
import { ChatInputBox, ClarificationCard, ApprovalCard } from '@/components/ui';
import type { ChatInputBoxProps, ClarificationQuestion, ClarificationAnswers } from '@/components/ui';
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
    content: React.ReactNode;
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollTop > 0);
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  return (
    <div className={cn('relative flex flex-col min-h-0 flex-1 min-w-(--sizing-chat-min) max-w-(--sizing-chat-max)', className)}>

      {/* ─── Scroll container ─────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin]"
      >
        <div className="flex flex-col min-h-full">

          {/* ─── Sticky header ────────────────────────────────────────────────── */}
          {title !== undefined && (
            <div className="sticky top-0 z-20 px-4 pt-4 bg-(--bg-surface-base)">
              <EditableTitle
                title={title}
                onTitleChange={onTitleChange}
                onMenuClick={onMenuClick ?? (() => {})}
              />
              {/* Gradient fade — extends below header, animates in when content scrolls behind */}
              <motion.div
                className="absolute inset-x-0 top-full h-8 bg-linear-to-b from-(--bg-surface-base) to-transparent pointer-events-none"
                animate={{ opacity: isScrolled ? 1 : 0 }}
                transition={disableMotion ? { duration: 0 } : { duration: 0.2 }}
              />
            </div>
          )}

          {/* ─── Thread content ───────────────────────────────────────────────── */}
          <div className="flex-1">
            {children}
          </div>

          {/* ─── Sticky footer ────────────────────────────────────────────────── */}
          {hasFooter && !approval && (
            <div className="sticky bottom-0 z-20 px-4 pb-4 bg-(--bg-surface-base)">
              {/* Gradient fade — extends above footer, animates in when content scrolls behind */}
              <motion.div
                className="absolute inset-x-0 bottom-full h-10 bg-linear-to-t from-(--bg-surface-base) to-transparent pointer-events-none"
                animate={{ opacity: isAtBottom ? 0 : 1 }}
                transition={disableMotion ? { duration: 0 } : { duration: 0.2 }}
              />

              {/* Scroll-to-bottom button — sits in the gradient area above the footer */}
              <AnimatePresence>
                {!isAtBottom && (
                  <motion.button
                    className="absolute left-1/2 -translate-x-1/2 bottom-full -translate-y-3 z-10 w-7 h-7 rounded-full bg-(--bg-surface-base) border border-(--border-default) shadow-md flex items-center justify-center text-(--text-secondary) hover:text-(--text-primary) transition-colors cursor-pointer"
                    onClick={scrollToBottom}
                    initial={disableMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={disableMotion ? undefined : { opacity: 0, y: 4 }}
                    transition={disableMotion ? { duration: 0 } : { duration: 0.15 }}
                    aria-label="Scroll to bottom"
                    style={{ willChange: 'transform' }}
                  >
                    <ChevronDown size={14} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Bottom-sheet container — each footer component slides up to enter, down to exit */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={footerKey}
                  initial={disableMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={disableMotion ? undefined : { opacity: 0, y: 16 }}
                  transition={disableMotion ? { duration: 0 } : { duration: 0.15 }}
                >
                  {footerAddon}
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
          )}

        </div>
      </div>

      {/* Approval overlay — bottom-sheet that covers the chat thread, outside scroll area */}
      <AnimatePresence>
        {approval && (
          <motion.div
            className="absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end"
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
            <div className="relative px-4 pb-4">
              <ApprovalCard
                onApprove={approval.onApprove}
                onReject={approval.onReject}
                surface={approval.surface}
                disableMotion={disableMotion}
              >
                {approval.content}
              </ApprovalCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
