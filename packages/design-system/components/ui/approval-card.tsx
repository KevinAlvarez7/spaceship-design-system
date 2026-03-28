'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button } from './button';

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const approvalCardVariants = cva(
  [
    'flex flex-col gap-2',
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

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ApprovalCardProps
  extends VariantProps<typeof approvalCardVariants> {
  children: React.ReactNode;
  onApprove?: () => void;
  onReject?: () => void;
  approveLabel?: string;
  rejectLabel?: string;
  disableMotion?: boolean;
  className?: string;
}

// ─── ApprovalCard ─────────────────────────────────────────────────────────────

export function ApprovalCard({
  children,
  onApprove,
  onReject,
  approveLabel = 'Approve plan',
  rejectLabel = 'Request changes',
  disableMotion = false,
  surface,
  className,
}: ApprovalCardProps) {
  const containerClasses = cn(
    'rounded-lg bg-(--bg-surface-base)',
    (surface ?? 'shadow-border') === 'shadow-border' && 'shadow-(--shadow-border)',
  );

  return (
    <div className={cn(approvalCardVariants({ surface }), className)}>

      {/* ── Document container ── */}
      <ScrollAreaPrimitive.Root className={cn(containerClasses, 'overflow-hidden')}>
        <ScrollAreaPrimitive.Viewport className="max-h-80 w-full">
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

      {/* ── Action bar ── */}
      <div className={cn(containerClasses, 'flex items-center justify-end gap-2 px-4 py-3')}>
        <Button
          variant="ghost"
          size="md"
          onClick={onReject}
          disableMotion={disableMotion}
        >
          {rejectLabel}
        </Button>
        <Button
          variant="success"
          size="md"
          onClick={onApprove}
          disableMotion={disableMotion}
        >
          {approveLabel}
        </Button>
      </div>

    </div>
  );
}
