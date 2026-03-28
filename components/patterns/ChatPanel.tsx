'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { EditableTitle } from '@/components/patterns/EditableTitle';
import { Button, ChatInputBox, ClarificationCard, ApprovalCard } from '@/components/ui';
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
  const isAtBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolled(el.scrollTop > 0);
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setIsAtBottom(atBottom);
    isAtBottomRef.current = atBottom;
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  // Auto-scroll when content grows (new messages) — only if already at bottom, only on grow
  const prevScrollHeightRef = useRef(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const content = el.firstElementChild;
    if (!content) return;
    const observer = new ResizeObserver(() => {
      if (!isAtBottomRef.current) return;
      const newHeight = el.scrollHeight;
      if (newHeight > prevScrollHeightRef.current) {
        el.scrollTo({ top: newHeight, behavior: 'instant' });
      }
      prevScrollHeightRef.current = newHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn('relative flex flex-col min-h-0 flex-1 min-w-(--sizing-chat-min)', className)}>

      {/* ─── Scroll container — full height, rubber-bands on overscroll ──────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-none [scrollbar-width:thin]"
      >
        <div className="flex flex-col min-h-full">

          {/* ─── Sticky header ────────────────────────────────────────────────── */}
          {title !== undefined && (
            <div className="sticky top-0 z-20 pointer-events-none">
              {/* Gradient background — anchored to header top, overflows 128px down into scroll area */}
              <motion.div
                className="absolute inset-x-0 top-0 h-32 [background:linear-gradient(to_bottom,var(--bg-surface-base)_0%,color-mix(in_srgb,var(--bg-surface-base)_90%,transparent)_25%,color-mix(in_srgb,var(--bg-surface-base)_70%,transparent)_55%,color-mix(in_srgb,var(--bg-surface-base)_30%,transparent)_80%,transparent_100%)]"
                animate={{ opacity: isScrolled ? 1 : 0 }}
                transition={disableMotion ? { duration: 0 } : { duration: 0.2 }}
              />
              <div className="relative max-w-(--sizing-chat-max) mx-auto w-full px-4 pt-4 pb-4 pointer-events-auto">
                <EditableTitle
                  title={title}
                  onTitleChange={onTitleChange}
                  onMenuClick={onMenuClick ?? (() => {})}
                />
              </div>
            </div>
          )}

          {/* ─── Thread content — natural flow ──────────────────────────────── */}
          <div className="flex-1 max-w-(--sizing-chat-max) mx-auto w-full">
            {children}
          </div>

          {/* ─── Sticky footer ────────────────────────────────────────────────── */}
          {hasFooter && !approval && (
            <div className="sticky bottom-0 z-20 pointer-events-none">
              <div className="relative max-w-(--sizing-chat-max) mx-auto w-full px-4 pb-4 pointer-events-auto">
                {/* Scroll-to-bottom button — floats above footer */}
                <AnimatePresence>
                  {!isAtBottom && (
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 bottom-full -translate-y-3 z-10"
                      initial={disableMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={disableMotion ? undefined : { opacity: 0, y: 4 }}
                      transition={disableMotion ? { duration: 0 } : { duration: 0.15 }}
                      style={{ willChange: 'transform' }}
                    >
                      <Button
                        variant="secondary"
                        surface="shadow"
                        size="icon-sm"
                        icon={<ChevronDown />}
                        onClick={scrollToBottom}
                        aria-label="Scroll to bottom"
                        className="shadow-border-hover"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom-sheet container — each footer component slides up to enter, down to exit */}
                <AnimatePresence mode="popLayout" initial={false}>
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
            </div>
          )}

        </div>
      </div>

      {/* Approval overlay — bottom-sheet outside scroll area */}
      <AnimatePresence>
        {approval && (
          <motion.div
            className="absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end"
            initial={disableMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={disableMotion ? undefined : { opacity: 0, y: 24 }}
            transition={disableMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
          >
            <div
              className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-linear-to-t from-(--bg-surface-base) to-transparent"
              aria-hidden
            />
            <div className="relative max-w-(--sizing-chat-max) mx-auto w-full px-4 pb-4">
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
