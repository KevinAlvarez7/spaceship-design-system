'use client';

/* ─────────────────────────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — FeedbackForm
 *
 * Springs used
 *   snappy  visualDuration: 0.2s, bounce: 0  (ζ = 1.0)  — opacity fades,
 *           layoutId morph, button position morph
 *   gentle  stiffness: 160, damping: 24     (ζ ≈ 0.95)  — label reposition
 *           (MotionConfig default, overridden per-element by snappy)
 *
 * ─── Idle (collapsed) ────────────────────────────────────────────────────────
 *   Trigger button
 *     hover  → bg: surface-base → surface-primary  (CSS transition-colors, 200ms)
 *     active → bg: surface-base → surface-secondary (CSS transition-colors, 200ms)
 *
 * ─── Open (trigger → form) ───────────────────────────────────────────────────
 *   AnimatePresence mode="popLayout" initial={false}
 *
 *   Trigger exit
 *     0ms        popped to position:absolute (removed from layout flow)
 *     0 → ~200ms opacity  1 → 0             (spring: snappy)
 *
 *   Form enter
 *     0ms        container snaps to form height (outer div is not a motion element)
 *     0 → ~200ms opacity  0 → 1             (spring: snappy)
 *
 *   Button morph  (shared layoutId)
 *     0 → ~200ms position + size  full-width → flex-1 compact  (spring: snappy)
 *     0 → ~200ms borderRadius  4px → 4px  (interpolated via inline style)
 *
 *   Label reposition  (layout="position")
 *     0 → ~300ms xy position only — no width/height stretch  (spring: gentle)
 *
 *   After state settles
 *     textarea auto-focused via useEffect
 *
 * ─── Hover / active (expanded form) ─────────────────────────────────────────
 *   Submit button
 *     hover  → bg: primary-default → primary-hover   (CSS transition-colors, 200ms)
 *     active → bg: primary-default → primary-pressed (CSS transition-colors, 200ms)
 *   Cancel button
 *     tap    → scale 1 → 0.96 → 1                    (spring: interactive, DS Button)
 *
 * ─── Close (cancel or submit) ────────────────────────────────────────────────
 *   Reverse of Open — exact mirror
 *
 *   Form exit
 *     0ms        popped to position:absolute
 *     0 → ~200ms opacity  1 → 0             (spring: snappy)
 *
 *   Trigger enter
 *     0ms        container snaps to trigger height
 *     0 → ~200ms opacity  0 → 1             (spring: snappy)
 *
 *   Button morph  (shared layoutId, reverse direction)
 *     0 → ~200ms position + size  flex-1 compact → full-width  (spring: snappy)
 *
 *   Label reposition  (layout="position", reverse)
 *     0 → ~300ms xy position only            (spring: gentle)
 * ───────────────────────────────────────────────────────────────────────────── */

import { useRef, useState, useEffect, useId } from 'react';
import { motion, AnimatePresence, LayoutGroup, MotionConfig } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Pencil, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { springs } from '@/tokens/motion';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Local CVA for the trigger (collapsed) and submit (expanded) button shapes. */
const triggerVariants = cva(
  [
    'flex items-center justify-between w-full',
    'p-3 gap-1',
    'rounded-sm',
    'cursor-pointer select-none',
    'font-sans [font-weight:var(--font-weight-semibold)]',
    '[font-size:var(--font-size-sm)] leading-(--line-height-sm)',
    '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:[stroke-width:2.75]',
  ],
  {
    variants: {
      role: {
        trigger: [
          'bg-(--bg-surface-base)',
          'text-(--text-primary)',
        ],
        submit: [
          'bg-(--bg-interactive-primary-default)',
          'text-(--text-inverse)',
          'hover:bg-(--bg-interactive-primary-hover)',
          'active:bg-(--bg-interactive-primary-pressed)',
          'transition-colors duration-(--duration-base)',
        ],
      },
      hasShadow: {
        true:  'shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow duration-(--duration-base) ease-(--ease-in-out)',
        false: '',
      },
    },
    defaultVariants: { hasShadow: true },
  },
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
  const id                  = useId();
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

  // ── Textarea classes (shared between motion and static paths) ─────────────
  const textareaClasses = cn(
    'w-full resize-none p-1',
    'font-(family-name:--font-family-secondary)',
    '[font-size:var(--font-size-base)] leading-6',
    'text-(--text-primary) placeholder:text-(--text-placeholder)',
    'bg-transparent outline-none',
  );

  // ── Static path ───────────────────────────────────────────────────────────
  if (disableMotion) {
    return (
      <div className={cn(feedbackFormVariants({ surface }), className)}>
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className={cn(
              triggerVariants({ role: 'trigger', hasShadow }),
              'transition-colors duration-(--duration-base) ease-in-out',
              'hover:bg-(--bg-surface-primary) active:bg-(--bg-surface-secondary)',
            )}
          >
            <span>{submitLabel}</span>
            <Pencil aria-hidden="true" />
          </button>
        ) : (
          <div className={cn(
            'flex flex-col rounded-sm overflow-hidden',
            'bg-(--bg-surface-base)',
            hasShadow && 'shadow-(--shadow-border)',
          )}>
            <div className="px-3 pt-3 pb-2">
              <textarea
                ref={textareaRef}
                placeholder={placeholder}
                rows={3}
                className={textareaClasses}
              />
            </div>
            <div className="flex items-center gap-2 px-3 pb-3">
              <Button variant="secondary" surface="flat" size="md" onClick={handleCancel} disableMotion className="flex-1 py-3">
                Cancel
              </Button>
              <button
                onClick={handleSubmit}
                className={cn(triggerVariants({ role: 'submit', hasShadow: false }), 'flex-1')}
              >
                <span>{submitLabel}</span>
                <ArrowUp aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Motion path ───────────────────────────────────────────────────────────
  // relative: scopes mode="popLayout" absolute positioning of the exiting element.
  return (
    <div className={cn(feedbackFormVariants({ surface }), 'relative', className)}>
      <MotionConfig transition={springs.gentle}>
        <LayoutGroup id={id}>
          <AnimatePresence mode="popLayout" initial={false}>
            {!open ? (

              /* ── Trigger — full-width, shadow visible ── */
              <motion.button
                key="trigger"
                layoutId={`${id}-feedback-btn`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(true)}
                className={cn(
                  triggerVariants({ role: 'trigger', hasShadow }),
                  'hover:bg-(--bg-surface-primary) active:bg-(--bg-surface-secondary)',
                  'transition-colors duration-(--duration-base)',
                )}
                style={{ borderRadius: 4 }}
                transition={springs.snappy}
              >
                <motion.span layout="position">{submitLabel}</motion.span>
                <Pencil aria-hidden="true" />
              </motion.button>

            ) : (

              /* ── Form — overflow-hidden clips internal content ── */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'flex flex-col rounded-sm overflow-hidden',
                  'bg-(--bg-surface-base)',
                  hasShadow && 'shadow-(--shadow-border)',
                )}
                style={{ borderRadius: 4 }}
                transition={springs.snappy}
              >
                <div className="px-3 pt-3 pb-2">
                  <textarea
                    ref={textareaRef}
                    placeholder={placeholder}
                    rows={3}
                    className={textareaClasses}
                  />
                </div>
                <div className="flex items-center gap-2 px-3 pb-3">
                  <Button variant="secondary" surface="flat" size="md" onClick={handleCancel} className="flex-1 py-3">
                    Cancel
                  </Button>
                  <motion.button
                    layoutId={`${id}-feedback-btn`}
                    layoutDependency={false}
                    onClick={handleSubmit}
                    className={cn(triggerVariants({ role: 'submit', hasShadow: false }), 'flex-1')}
                    style={{ borderRadius: 4, willChange: 'transform' }}
                    transition={springs.snappy}
                  >
                    <motion.span layout="position">{submitLabel}</motion.span>
                    <ArrowUp aria-hidden="true" />
                  </motion.button>
                </div>
              </motion.div>

            )}
          </AnimatePresence>
        </LayoutGroup>
      </MotionConfig>
    </div>
  );
}
