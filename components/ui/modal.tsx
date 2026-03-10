"use client";

import { useSyncExternalStore, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ζ = 30 / (2 × √400) = 0.75 ✓
const MODAL_SPRING = springs.interactive;

// Detects client-side rendering without triggering setState-in-effect lint rule.
function useIsClient() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

const modalVariants = cva(
  [
    'flex flex-col bg-(--bg-surface-primary)',
    'rounded-lg overflow-hidden',
    'w-full max-w-lg',
    'p-3',
    'gap-8',
  ],
  {
    variants: {
      surface: {
        default:       'shadow-(--shadow-border)',
        'shadow-border': 'shadow-(--shadow-border) transition-shadow duration-(--duration-base) ease-(--ease-in-out)',
      },
    },
    defaultVariants: {
      surface: 'default',
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
  disableMotion?: boolean;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function ModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-2 p-1', className)} {...props} />
  );
}

export function ModalTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'font-sans [font-size:var(--font-size-xl)] [font-weight:var(--font-weight-bold)] leading-(--line-height-lg)',
        'text-(--text-primary)',
        className
      )}
      {...props}
    />
  );
}

export function ModalDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'font-sans [font-size:var(--font-size-base)] [font-weight:var(--font-weight-regular)] leading-(--line-height-base)',
        'text-(--text-secondary)',
        className
      )}
      {...props}
    />
  );
}

export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-3', className)}
      {...props}
    />
  );
}

export function Modal({
  open,
  onClose,
  children,
  className,
  surface,
  disableMotion = false,
  'aria-labelledby': labelledby,
  'aria-describedby': describedby,
}: ModalProps) {
  const isClient = useIsClient();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Escape key to close
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Focus trap: move focus into dialog on open
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center px-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-(--overlay-medium)"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal={true}
            aria-labelledby={labelledby}
            aria-describedby={describedby}
            tabIndex={-1}
            ref={dialogRef}
            className={cn('relative z-10', modalVariants({ surface }), className)}
            style={{ willChange: 'transform' }}
            initial={disableMotion ? {} : { scale: 0.95, y: 8 }}
            animate={disableMotion ? {} : { scale: 1, y: 0 }}
            exit={disableMotion ? {} : { scale: 0.95, y: 8 }}
            transition={MODAL_SPRING}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export { modalVariants };
