'use client';

import { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence, MotionConfig } from 'motion/react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { useDragResize } from './use-drag-resize';
import { scales, springs } from '@/tokens/motion';
import { resolveColor } from '@/lib/resolve-color';

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const approvalCardVariants = cva(
  [
    'flex flex-col gap-4',
    'w-full',
    'min-w-(--sizing-chat-min)',
    'max-w-(--sizing-chat-max)',
    'font-sans',
  ],
  {
    variants: {
      surface: {
        default:         '',
        'shadow-border': '',
      },
    },
    defaultVariants: { surface: 'shadow-border' },
  },
);

const actionRowVariants = cva(
  [
    'flex items-center justify-between w-full',
    'px-3 py-3',
    'rounded',
    'cursor-pointer select-none',
    'font-(family-name:--font-family-secondary)',
    '[font-size:var(--font-size-base)] leading-6',
    '[font-weight:var(--font-weight-regular)]',
  ],
  {
    variants: {
      intent: {
        approve: [
          'bg-(--bg-interactive-success-default)',
          'text-(--text-inverse)',
        ],
        reject: [
          'bg-(--bg-surface-base)',
          'text-(--text-primary)',
        ],
      },
      hasShadow: {
        true:  'shadow-(--shadow-border)',
        false: '',
      },
    },
    defaultVariants: { hasShadow: true },
  },
);

// ─── Color animation tokens ───────────────────────────────────────────────────

const COLOR_TRANSITION   = { duration: 0.33, ease: 'easeOut' as const };
const PRESSED_TRANSITION = { duration: 0.08, ease: 'easeOut' as const };

const APPROVE_TOKENS = {
  default: '--bg-interactive-success-default',
  hover:   '--bg-interactive-success-hover',
  pressed: '--bg-interactive-success-pressed',
} as const;

const REJECT_TOKENS = {
  default: '--bg-surface-base',
  hover:   '--bg-surface-primary',
  pressed: '--bg-surface-secondary',
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ApprovalCardProps
  extends VariantProps<typeof approvalCardVariants> {
  children: React.ReactNode;
  /** Title displayed in the header bar. */
  title?: string;
  onApprove?: () => void;
  /** Called when the user submits change feedback. Receives optional message text. */
  onReject?: (message?: string) => void;
  approveLabel?: string;
  rejectLabel?: string;
  disableMotion?: boolean;
  /** Returns the max pixel height the card may expand to. Used by ChatPanel to stop at the header. */
  getMaxHeight?: () => number;
  className?: string;
}

// ─── ApprovalCard ─────────────────────────────────────────────────────────────

export function ApprovalCard({
  children,
  title = 'Implementation Plan',
  onApprove,
  onReject,
  approveLabel = 'Approve Plan',
  rejectLabel  = 'Request Changes',
  disableMotion = false,
  getMaxHeight,
  surface,
  className,
}: ApprovalCardProps) {
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [changeMessage, setChangeMessage]           = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasShadow  = (surface ?? 'shadow-border') === 'shadow-border';
  const actionsRef = useRef<HTMLDivElement>(null);

  // ── Card resize (drag handle) ──────────────────────────────────────────────
  // Subtract actions height + gap from available ceiling so card + actions never exceed viewport.
  const cardMaxHeight = useCallback(() => {
    const parentMax = getMaxHeight?.() ?? window.innerHeight * 0.85;
    const actionsH  = actionsRef.current?.offsetHeight ?? 0;
    const gap       = 16; // gap-4
    return Math.max(parentMax - actionsH - gap, 100);
  }, [getMaxHeight]);

  const { cardRef, cardHeight, handleProps, animateToContent } = useDragResize({ disableMotion, maxNaturalHeight: 400, getMaxHeight: cardMaxHeight });

  // Measure initial natural height so drag floor is set correctly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { animateToContent(); }, []);

  // Auto-focus the textarea when the request-changes panel opens.
  useEffect(() => {
    if (requestChangesOpen) textareaRef.current?.focus();
  }, [requestChangesOpen]);

  // ── Action row color animations ────────────────────────────────────────────
  const approveColorControls = useAnimation();
  const rejectColorControls  = useAnimation();
  const colorMountedRef = useRef(false);

  useEffect(() => {
    colorMountedRef.current = true;
    if (!disableMotion) {
      approveColorControls.set({ backgroundColor: resolveColor(APPROVE_TOKENS.default) });
      rejectColorControls.set({ backgroundColor: resolveColor(REJECT_TOKENS.default) });
    }
    return () => { colorMountedRef.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCancel() {
    setRequestChangesOpen(false);
    setChangeMessage('');
  }

  function handleSubmit() {
    onReject?.(changeMessage || undefined);
    setRequestChangesOpen(false);
    setChangeMessage('');
  }

  const cardClasses = cn(
    'flex flex-col rounded-lg overflow-hidden bg-(--bg-surface-primary)',
    hasShadow && 'shadow-(--shadow-border)',
  );

  return (
    <div className={cn(approvalCardVariants({ surface }), className)}>

      {/* ── Resizable card ── */}
      <motion.div
        ref={cardRef}
        style={{ height: cardHeight, willChange: 'height' }}
        className={cardClasses}
      >
        {/* Drag handle */}
        <div
          {...handleProps}
          className="flex justify-center py-2 bg-(--bg-surface-secondary) cursor-grab touch-none select-none"
        >
          <div className="w-8 h-1 rounded-full bg-(--bg-surface-tertiary)" />
        </div>

        {/* Header */}
        <div className="bg-(--bg-surface-secondary) border-b border-(--bg-surface-tertiary) px-3 py-2">
          <h3 className="font-(family-name:--font-family-secondary) font-bold [font-size:var(--font-size-base)] leading-6 text-(--text-primary) whitespace-nowrap">
            {title}
          </h3>
        </div>

        {/* Scrollable content */}
        <ScrollAreaPrimitive.Root className="flex-1 min-h-0 overflow-hidden">
          <ScrollAreaPrimitive.Viewport className="h-full w-full">
            <div className="p-4">
              {children}
            </div>
          </ScrollAreaPrimitive.Viewport>
          <ScrollAreaPrimitive.Scrollbar
            orientation="vertical"
            className="flex w-2 touch-none select-none transition-colors px-0.5 py-2"
          >
            <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-(--bg-surface-tertiary)" />
          </ScrollAreaPrimitive.Scrollbar>
        </ScrollAreaPrimitive.Root>
      </motion.div>

      {/* ── Action rows ── */}
      {disableMotion ? (
        <div ref={actionsRef} className="flex flex-col gap-2 px-px pt-px pb-2 -mx-px -mt-px -mb-2">

          {/* Approve */}
          <button
            onClick={onApprove}
            className={cn(
              actionRowVariants({ intent: 'approve', hasShadow }),
              'transition-colors duration-(--duration-base) ease-(--ease-in-out) hover:bg-(--bg-interactive-success-hover) active:bg-(--bg-interactive-success-pressed)',
            )}
          >
            <span>{approveLabel}</span>
            <CheckCircle className="size-5 shrink-0" aria-hidden="true" />
          </button>

          {/* Request Changes — instant swap when disableMotion */}
          {!requestChangesOpen ? (
            <button
              onClick={() => setRequestChangesOpen(true)}
              className={cn(
                actionRowVariants({ intent: 'reject', hasShadow }),
                'transition-colors duration-(--duration-base) ease-(--ease-in-out) hover:bg-(--bg-surface-primary) active:bg-(--bg-surface-secondary)',
              )}
            >
              <span>{rejectLabel}</span>
              <Pencil className="size-5 shrink-0" aria-hidden="true" />
            </button>
          ) : (
            <div className={cn('bg-(--bg-surface-base) rounded p-3 flex flex-col gap-3 overflow-hidden', hasShadow && 'shadow-border')}>
              <textarea
                ref={textareaRef}
                value={changeMessage}
                onChange={e => setChangeMessage(e.target.value)}
                placeholder="Explain the changes you want to make..."
                rows={3}
                className={cn('w-full resize-none p-1', 'font-(family-name:--font-family-secondary)', '[font-size:var(--font-size-base)] leading-6', 'text-(--text-primary) placeholder:text-(--text-placeholder)', 'bg-transparent outline-none')}
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel} disableMotion>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSubmit} disableMotion>{rejectLabel}</Button>
              </div>
            </div>
          )}

        </div>
      ) : (
        <MotionConfig transition={springs.snappy}>
          <div ref={actionsRef} className="flex flex-col gap-2 px-px pt-px pb-2 -mx-px -mt-px -mb-2">

            {/* Approve */}
            <motion.button
              onClick={onApprove}
              className={actionRowVariants({ intent: 'approve', hasShadow })}
              style={{ willChange: 'transform' }}
              animate={approveColorControls}
              whileHover={{ scale: scales.prominent.hover }}
              whileTap={{ scale: scales.prominent.tap }}
              transition={springs.interactive}
              onHoverStart={() => {
                if (colorMountedRef.current) approveColorControls.start({ backgroundColor: resolveColor(APPROVE_TOKENS.hover) }, COLOR_TRANSITION);
              }}
              onHoverEnd={() => {
                if (colorMountedRef.current) approveColorControls.start({ backgroundColor: resolveColor(APPROVE_TOKENS.default) }, COLOR_TRANSITION);
              }}
              onTapStart={() => {
                if (colorMountedRef.current) approveColorControls.start({ backgroundColor: resolveColor(APPROVE_TOKENS.pressed) }, PRESSED_TRANSITION);
              }}
              onTap={() => {
                if (colorMountedRef.current) approveColorControls.start({ backgroundColor: resolveColor(APPROVE_TOKENS.hover) }, COLOR_TRANSITION);
              }}
              onTapCancel={() => {
                if (colorMountedRef.current) approveColorControls.start({ backgroundColor: resolveColor(APPROVE_TOKENS.default) }, COLOR_TRANSITION);
              }}
            >
              <span>{approveLabel}</span>
              <CheckCircle className="size-5 shrink-0" aria-hidden="true" />
            </motion.button>

            {/* Request Changes — outer container + button both morph via layoutId (3-level) */}
            <AnimatePresence mode="popLayout" initial={false}>
              {!requestChangesOpen ? (
                // Closed: outer wrapper gives container layoutId; shadow lives here
                <motion.div
                  key="reject-btn"
                  layoutId="reject-panel"
                  className={cn('rounded overflow-hidden w-full', hasShadow && 'shadow-border')}
                  style={{ willChange: 'transform' }}
                >
                  <motion.button
                    layoutId="reject-cta"
                    onClick={() => setRequestChangesOpen(true)}
                    className={actionRowVariants({ intent: 'reject', hasShadow: false })}
                    style={{ willChange: 'transform' }}
                    animate={rejectColorControls}
                    whileHover={{ scale: scales.prominent.hover }}
                    whileTap={{ scale: scales.prominent.tap }}
                    transition={springs.interactive}
                    onHoverStart={() => {
                      if (colorMountedRef.current) rejectColorControls.start({ backgroundColor: resolveColor(REJECT_TOKENS.hover) }, COLOR_TRANSITION);
                    }}
                    onHoverEnd={() => {
                      if (colorMountedRef.current) rejectColorControls.start({ backgroundColor: resolveColor(REJECT_TOKENS.default) }, COLOR_TRANSITION);
                    }}
                    onTapStart={() => {
                      if (colorMountedRef.current) rejectColorControls.start({ backgroundColor: resolveColor(REJECT_TOKENS.pressed) }, PRESSED_TRANSITION);
                    }}
                    onTap={() => {
                      if (colorMountedRef.current) rejectColorControls.start({ backgroundColor: resolveColor(REJECT_TOKENS.hover) }, COLOR_TRANSITION);
                    }}
                    onTapCancel={() => {
                      if (colorMountedRef.current) rejectColorControls.start({ backgroundColor: resolveColor(REJECT_TOKENS.default) }, COLOR_TRANSITION);
                    }}
                  >
                    <motion.span layoutId="reject-label">{rejectLabel}</motion.span>
                    <Pencil className="size-5 shrink-0" aria-hidden="true" />
                  </motion.button>
                </motion.div>
              ) : (
                // Open: same layoutId on outer div; container morphs from button size to form size
                <motion.div
                  key="reject-form"
                  layoutId="reject-panel"
                  className={cn('bg-(--bg-surface-base) rounded p-3 flex flex-col gap-3 overflow-hidden', hasShadow && 'shadow-border')}
                  style={{ willChange: 'transform' }}
                >
                  <textarea
                    ref={textareaRef}
                    value={changeMessage}
                    onChange={e => setChangeMessage(e.target.value)}
                    placeholder="Explain the changes you want to make..."
                    rows={3}
                    className={cn(
                      'w-full resize-none p-1',
                      'font-(family-name:--font-family-secondary)',
                      '[font-size:var(--font-size-base)] leading-6',
                      'text-(--text-primary) placeholder:text-(--text-placeholder)',
                      'bg-transparent outline-none',
                    )}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCancel} disableMotion={false}>Cancel</Button>
                    <motion.button
                      layoutId="reject-cta"
                      className={cn(
                        'flex items-center justify-center gap-2',
                        'px-3 py-2 rounded',
                        'bg-(--bg-interactive-primary-default) text-(--text-inverse)',
                        'font-(family-name:--font-family-secondary)',
                        '[font-size:var(--font-size-sm)] leading-5',
                        'font-medium',
                      )}
                      onClick={handleSubmit}
                      style={{ willChange: 'transform' }}
                    >
                      <motion.span layoutId="reject-label">{rejectLabel}</motion.span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </MotionConfig>
      )}

    </div>
  );
}
