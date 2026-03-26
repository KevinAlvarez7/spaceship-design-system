'use client';

import { Fragment } from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tag } from './tag';
import { Button } from './button';
import type { RiskLevel } from './clarification-card';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanStep {
  title: string;
  description?: string;
  timeEstimate: string;
  riskLevel: RiskLevel;
}

export interface RiskSummary {
  overallRisk: RiskLevel;
  notes: string[];
}

export interface ApprovalPlan {
  title: string;
  steps: PlanStep[];
  riskSummary: RiskSummary;
  totalEstimate: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RISK_TAG_VARIANT: Record<RiskLevel, 'success' | 'warning' | 'error'> = {
  safe:   'success',
  low:    'success',
  medium: 'warning',
  high:   'error',
};

const RISK_LABEL: Record<RiskLevel, string> = {
  safe:   'Safe',
  low:    'Low risk',
  medium: 'Medium risk',
  high:   'High risk',
};

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const approvalCardVariants = cva(
  [
    'flex flex-col',
    'w-full',
    'min-w-(--sizing-chat-min)',
    'max-w-(--sizing-chat-max)',
    'font-sans',
    'bg-(--bg-surface-base)',
    'rounded-lg overflow-hidden',
  ],
  {
    variants: {
      surface: {
        default:         '',
        'shadow-border': 'shadow-(--shadow-border)',
      },
    },
    defaultVariants: { surface: 'shadow-border' },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ApprovalCardProps
  extends VariantProps<typeof approvalCardVariants> {
  plan: ApprovalPlan;
  onApprove?: () => void;
  onReject?: () => void;
  disableMotion?: boolean;
  className?: string;
}

// ─── StepBadge ────────────────────────────────────────────────────────────────

function StepBadge({ n }: { n: number }) {
  return (
    <span className={cn(
      'flex items-center justify-center shrink-0',
      'w-6 h-6 rounded-md',
      'bg-(--bg-interactive-secondary-default)',
      'text-(--text-primary)',
      '[font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)]',
    )}>
      {n}
    </span>
  );
}

// ─── ApprovalCard ─────────────────────────────────────────────────────────────

export function ApprovalCard({
  plan,
  onApprove,
  onReject,
  disableMotion = false,
  surface,
  className,
}: ApprovalCardProps) {
  return (
    <div className={cn(approvalCardVariants({ surface }), className)}>

      {/* ── Scrollable plan body ── */}
      <ScrollAreaPrimitive.Root className="overflow-hidden">
        <ScrollAreaPrimitive.Viewport className="h-full w-full">

          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="[font-size:var(--font-size-base)] [font-weight:var(--font-weight-bold)] text-(--text-primary) leading-(--line-height-base)">
              {plan.title}
            </span>
            <Tag variant="neutral" size="sm">{plan.totalEstimate}</Tag>
          </div>
          <SeparatorPrimitive.Root className="h-px bg-(--bg-surface-secondary)" />

          {/* Steps */}
          <div className="flex flex-col">
            {plan.steps.map((step, i) => (
              <Fragment key={i}>
                {i > 0 && <SeparatorPrimitive.Root className="h-px bg-(--bg-surface-secondary)" />}
                <div className="flex items-start gap-3 px-4 py-3">
                  <StepBadge n={i + 1} />
                  <div className="flex-1 min-w-0">
                    <span className="[font-size:var(--font-size-sm)] text-(--text-primary) leading-(--line-height-base)">
                      {step.title}
                    </span>
                    {step.description && (
                      <p className="mt-0.5 [font-size:var(--font-size-xs)] text-(--text-secondary) leading-(--line-height-base)">
                        {step.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Tag variant="neutral" size="sm">{step.timeEstimate}</Tag>
                    <Tag variant={RISK_TAG_VARIANT[step.riskLevel]} size="sm">
                      {RISK_LABEL[step.riskLevel]}
                    </Tag>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>

          {/* Risk summary */}
          <SeparatorPrimitive.Root className="h-px bg-(--bg-surface-secondary)" />
          <div className="px-4 py-3 bg-(--bg-surface-secondary)">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-(--text-secondary) shrink-0" strokeWidth={2} />
              <span className="[font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)] text-(--text-secondary)">
                Security overview
              </span>
              <Tag variant={RISK_TAG_VARIANT[plan.riskSummary.overallRisk]} size="sm">
                {RISK_LABEL[plan.riskSummary.overallRisk]}
              </Tag>
            </div>
            <ul className="flex flex-col gap-1">
              {plan.riskSummary.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-1.5 [font-size:var(--font-size-xs)] text-(--text-secondary)">
                  <span className="mt-1 shrink-0 w-1 h-1 rounded-full bg-(--text-tertiary)" aria-hidden />
                  {note}
                </li>
              ))}
            </ul>
          </div>

        </ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.Scrollbar
          orientation="vertical"
          className="flex w-2 touch-none select-none transition-colors px-0.5 py-2"
        >
          <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-(--bg-surface-tertiary)" />
        </ScrollAreaPrimitive.Scrollbar>
      </ScrollAreaPrimitive.Root>

      {/* ── Sticky action footer ── */}
      <SeparatorPrimitive.Root className="h-px bg-(--bg-surface-secondary) shrink-0" />
      <div className="flex items-center justify-end gap-2 px-4 py-3 bg-(--bg-surface-base) shrink-0">
        <Button
          variant="ghost"
          size="md"
          onClick={onReject}
          disableMotion={disableMotion}
        >
          Request changes
        </Button>
        <Button
          variant="success"
          size="md"
          onClick={onApprove}
          disableMotion={disableMotion}
        >
          Approve plan
        </Button>
      </div>

    </div>
  );
}
