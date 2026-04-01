'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '@/tokens';
import { ChevronDown } from 'lucide-react';
import { EditableTitle } from '@/components/patterns/EditableTitle';
import { Button, ChatInputBox, ClarificationCard, ApprovalCard } from '@/components/ui';
import type { ChatInputBoxProps, ClarificationQuestion, ClarificationAnswer } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Gradient overlay helpers ─────────────────────────────────────────────────

/** Monochrome fractal noise SVG — tiles seamlessly for paper-grain overlay. */
const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;

/** Gradient mask: vertical opacity fade + 48px horizontal side fade, composited. */
function gradientMaskStyle(direction: 'to bottom' | 'to top'): React.CSSProperties {
  const vertical   = `linear-gradient(${direction}, black 0%, rgba(0,0,0,0.9) 25%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.3) 80%, transparent 100%)`;
  const horizontal = 'linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent)';
  const mask = `${vertical}, ${horizontal}`;
  return {
    maskImage:            mask,
    WebkitMaskImage:      mask,
    maskComposite:        'intersect',
    WebkitMaskComposite:  'source-in',
  } as React.CSSProperties;
}

// ─── Props ────────────────────────────────────────────────────────────────────

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
    onSubmit: (answers: ClarificationAnswer[]) => void;
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
    onReject: (message?: string) => void;
    surface?: 'default' | 'shadow-border';
  };

  /** Extra content rendered above the footer input/card (e.g., TaskList). */
  footerAddon?: React.ReactNode;
  /** Extra content rendered after the 3-dot menu in the sticky header bar. */
  headerTrailingSlot?: React.ReactNode;
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
  headerTrailingSlot,
}: ChatPanelProps) {
  const hasFooter = !!(input || clarification || footerAddon);
  const footerKey = approval ? 'approval' : clarification ? 'clarification' : input ? 'input' : 'empty';

  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Called at drag start — measures scroll container minus sticky header and footer padding.
  const getApprovalMaxHeight = useCallback(() => {
    const containerH = scrollRef.current?.clientHeight ?? window.innerHeight;
    const headerH    = headerRef.current?.offsetHeight ?? 0;
    const footerPad  = 16; // pb-4 on the footer wrapper
    return Math.max(containerH - headerH - footerPad, 100);
  }, []);

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
    <div className={cn('flex flex-col min-h-0 flex-1 min-w-(--sizing-chat-min)', className)}>

      {/* ─── Scroll container — full height, rubber-bands on overscroll ──────────── */}
      <motion.div
        ref={scrollRef}
        onScroll={handleScroll}
        layoutScroll
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-none [scrollbar-width:thin]"
      >
        <div className="flex flex-col min-h-full">

          {/* ─── Sticky header ────────────────────────────────────────────────── */}
          {title !== undefined && (
            <div ref={headerRef} className="sticky top-0 z-20 pointer-events-none">
              {/* Gradient background — anchored to header top, overflows 128px down into scroll area */}
              <motion.div
                className="absolute inset-x-0 top-0 h-32 bg-(--bg-surface-base)"
                style={gradientMaskStyle('to bottom')}
                animate={{ opacity: isScrolled ? 1 : 0 }}
                transition={disableMotion ? { duration: 0 } : { duration: 0.2 }}
              >
                <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundSize: '200px 200px' }} />
              </motion.div>
              <motion.div layout="position" transition={springs.layout} className="relative max-w-(--sizing-chat-max) mx-auto w-full px-4 py-4 pointer-events-auto">
                <EditableTitle
                  title={title}
                  onTitleChange={onTitleChange}
                  onMenuClick={onMenuClick ?? (() => {})}
                  trailingSlot={headerTrailingSlot}
                />
              </motion.div>
            </div>
          )}

          {/* ─── Thread content — natural flow ──────────────────────────────── */}
          <motion.div layout="position" transition={springs.layout} className="flex-1 max-w-(--sizing-chat-max) mx-auto w-full">
            {children}
          </motion.div>

          {/* ─── Sticky footer ────────────────────────────────────────────────── */}
          {(hasFooter || approval) && (
            <div className="sticky bottom-0 z-20 pointer-events-none">
              {/* Gradient background — anchored to footer bottom, overflows 128px up into scroll area */}
              <motion.div
                className="absolute inset-x-0 bottom-0 h-32 bg-(--bg-surface-base)"
                style={gradientMaskStyle('to top')}
                animate={{ opacity: isAtBottom ? 0 : 1 }}
                transition={disableMotion ? { duration: 0 } : { duration: 0.2 }}
              >
                <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundSize: '200px 200px' }} />
              </motion.div>
              <motion.div layout="position" transition={springs.layout} className="relative max-w-(--sizing-chat-max) mx-auto w-full px-4 pb-4 pointer-events-auto">
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
                    {approval ? (
                      <ApprovalCard
                        onApprove={approval.onApprove}
                        onReject={approval.onReject}
                        surface={approval.surface}
                        disableMotion={disableMotion}
                        getMaxHeight={getApprovalMaxHeight}
                      >
                        {approval.content}
                      </ApprovalCard>
                    ) : (
                      <>
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
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          )}

        </div>
      </motion.div>


    </div>
  );
}
