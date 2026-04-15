'use client';

/* ─────────────────────────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — FeedbackForm
 *
 * Springs used
 *   snappy  visualDuration: 0.2s, bounce: 0  (ζ = 1.0)  — all animations
 *
 * Architecture: the main button is ALWAYS mounted (never unmounts).
 * AnimatePresence handles only the textarea and Cancel entering/exiting.
 * The button repositions via `layout`, label via `layout="position"`.
 * No layoutId — no element swaps, no ghost copies.
 *
 * ─── Idle (collapsed) ────────────────────────────────────────────────────────
 *   Container wraps a single full-width button (bg-surface-base, shadow-border).
 *   Button:  hover → bg surface-primary  (CSS transition-colors, 200ms)
 *            press → bg surface-secondary (CSS transition-colors, 200ms)
 *
 * ─── Open (trigger → form) ───────────────────────────────────────────────────
 *   Textarea enter  (AnimatePresence)
 *     0 → ~200ms  height 0 → auto, opacity 0 → 1  (spring: snappy)
 *     Container grows naturally as content pushes button row down.
 *
 *   Cancel enter  (AnimatePresence mode="popLayout")
 *     0 → ~200ms  opacity 0 → 1  (spring: snappy)
 *     Immediately takes flex-1 space, shrinking the main button.
 *
 *   Main button resize  (layout)
 *     0 → ~200ms  width full → flex-1 compact  (spring: snappy)
 *     Button stays mounted — no unmount/remount.
 *
 *   Label reposition  (layout="position")
 *     0 → ~200ms  xy position only — no width/height stretch  (spring: snappy)
 *
 *   Icon swap  Pencil → ArrowUp  (instant, no animation)
 *   Textarea auto-focused via useEffect.
 *
 * ─── Hover / active (expanded form) ─────────────────────────────────────────
 *   Submit button
 *     hover  → bg surface-primary   (CSS transition-colors, 200ms)
 *     press  → bg surface-secondary (CSS transition-colors, 200ms)
 *   Cancel button
 *     tap    → scale 1 → 0.96 → 1  (spring: interactive, DS Button)
 *
 * ─── Close (cancel or submit) ────────────────────────────────────────────────
 *   Textarea exit  (AnimatePresence)
 *     0 → ~200ms  height auto → 0, opacity 1 → 0  (spring: snappy)
 *
 *   Cancel exit  (AnimatePresence mode="popLayout")
 *     0ms         popped to position:absolute (freed from layout flow)
 *     0 → ~200ms  opacity 1 → 0  (spring: snappy, fades at last position)
 *
 *   Main button resize  (layout, reverse)
 *     0 → ~200ms  width flex-1 compact → full  (spring: snappy)
 *
 *   Label reposition  (layout="position", reverse)
 *     0 → ~200ms  xy position only  (spring: snappy)
 *
 *   Icon swap  ArrowUp → Pencil  (instant)
 * ───────────────────────────────────────────────────────────────────────────── */

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Pencil, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { springs } from '@/tokens/motion';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Base classes for the always-mounted main button. */
const BUTTON_CLASSES = cn(
  'flex items-center justify-between',
  'p-3 gap-1 flex-1',
  'cursor-pointer select-none',
  'font-sans [font-weight:var(--font-weight-semibold)]',
  '[font-size:var(--font-size-sm)] leading-(--line-height-sm)',
  '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:[stroke-width:2.75]',
  'text-(--text-primary)',
  'hover:bg-(--bg-surface-primary) active:bg-(--bg-surface-secondary)',
  'transition-colors duration-(--duration-base)',
);

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const feedbackFormVariants = cva(
  [
    'flex flex-col',
    'w-full',
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

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FeedbackFormProps
  extends VariantProps<typeof feedbackFormVariants> {
  onSubmit?: (message?: string) => void;
  onCancel?: () => void;
  /** Label for the trigger button and submit button. Default: 'Request Changes' */
  submitLabel?: string;
  /** Textarea placeholder text. Default: "Describe the changes you'd like..." */
  placeholder?: string;
  disableMotion?: boolean;
  className?: string;
}

// ─── FeedbackForm ─────────────────────────────────────────────────────────────

export function FeedbackForm({
  onSubmit,
  onCancel,
  submitLabel  = 'Request Changes',
  placeholder  = "Describe the changes you'd like...",
  disableMotion = false,
  surface,
  className,
}: FeedbackFormProps) {
  const [open, setOpen]     = useState(false);
  const textareaRef         = useRef<HTMLTextAreaElement>(null);
  const hasShadow           = (surface ?? 'shadow-border') === 'shadow-border';

  // Auto-focus textarea when form opens.
  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  function handleCancel() {
    setOpen(false);
    onCancel?.();
  }

  function handleSubmit() {
    const message = textareaRef.current?.value;
    onSubmit?.(message || undefined);
    setOpen(false);
  }

  // ── Shared classes ────────────────────────────────────────────────────────
  const textareaClasses = cn(
    'w-full resize-none p-1',
    'font-(family-name:--font-family-secondary)',
    '[font-size:var(--font-size-base)] leading-6',
    'text-(--text-primary) placeholder:text-(--text-placeholder)',
    'bg-transparent outline-none',
  );

  const containerClasses = cn(
    'flex flex-col overflow-hidden',
    'bg-(--bg-surface-base)',
    hasShadow && 'shadow-(--shadow-border)',
  );

  // ── Static path ───────────────────────────────────────────────────────────
  if (disableMotion) {
    return (
      <div className={cn(feedbackFormVariants({ surface }), className)}>
        <div className={containerClasses} style={{ borderRadius: 4 }}>
          {open && (
            <div className="px-3 pt-3 pb-2">
              <textarea
                ref={textareaRef}
                placeholder={placeholder}
                rows={3}
                className={textareaClasses}
              />
            </div>
          )}
          <div className="flex items-center gap-1">
            {open && (
              <Button variant="secondary" surface="flat" size="md" onClick={handleCancel} disableMotion className="flex-1 p-3">
                Cancel
              </Button>
            )}
            <button
              onClick={open ? handleSubmit : () => setOpen(true)}
              className={BUTTON_CLASSES}
            >
              <span>{submitLabel}</span>
              {open ? <ArrowUp aria-hidden="true" /> : <Pencil aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Motion path ───────────────────────────────────────────────────────────
  return (
    <div className={cn(feedbackFormVariants({ surface }), className)}>
      <MotionConfig transition={springs.snappy}>
        <div className={containerClasses} style={{ borderRadius: 4 }}>

          {/* ── Textarea — enters/exits ── */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="textarea"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-3 pt-3 pb-2">
                  <textarea
                    ref={textareaRef}
                    placeholder={placeholder}
                    rows={3}
                    className={textareaClasses}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Button row — always mounted ── */}
          {/* relative: scopes popLayout absolute positioning of exiting Cancel. */}
          <div className="relative flex items-center gap-1">
            <AnimatePresence mode="popLayout" initial={false}>
              {open && (
                <motion.div
                  key="cancel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1"
                >
                  <Button variant="secondary" surface="flat" size="md" onClick={handleCancel} className="w-full p-3">
                    Cancel
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              layout
              onClick={open ? handleSubmit : () => setOpen(true)}
              className={BUTTON_CLASSES}
              style={{ willChange: 'transform' }}
            >
              <motion.span layout="position">{submitLabel}</motion.span>
              {open ? <ArrowUp aria-hidden="true" /> : <Pencil aria-hidden="true" />}
            </motion.button>
          </div>

        </div>
      </MotionConfig>
    </div>
  );
}
