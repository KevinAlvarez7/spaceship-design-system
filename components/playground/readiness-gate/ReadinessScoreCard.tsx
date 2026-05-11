'use client';

import { motion } from 'motion/react';
import { Check, AlertTriangle, X, FileText } from 'lucide-react';
import { Button, Tag } from '@/components/ui';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssumptionStatus = 'validated' | 'partial' | 'unvalidated';

export interface AssumptionRow {
  id:           string;
  label:        string;
  status:       AssumptionStatus;
  evidenceNote?: string;
}

export type ReadinessSummary = 'ready' | 'needs-evidence' | 'blocked';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<AssumptionStatus, 'success' | 'warning' | 'error'> = {
  validated:   'success',
  partial:     'warning',
  unvalidated: 'error',
};

const STATUS_LABEL: Record<AssumptionStatus, string> = {
  validated:   'Validated',
  partial:     'Partially validated',
  unvalidated: 'Unvalidated',
};

const STATUS_ICON: Record<AssumptionStatus, React.ReactNode> = {
  validated:   <Check className="h-3 w-3" />,
  partial:     <AlertTriangle className="h-3 w-3" />,
  unvalidated: <X className="h-3 w-3" />,
};

const SUMMARY_VARIANT: Record<ReadinessSummary, 'success' | 'warning' | 'error'> = {
  ready:            'success',
  'needs-evidence': 'warning',
  blocked:          'error',
};

const SUMMARY_LABEL: Record<ReadinessSummary, string> = {
  ready:            'Ready to ship',
  'needs-evidence': 'Needs evidence',
  blocked:          'Blocked — unvalidated assumptions',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derives the summary from the worst-case assumption status. */
export function deriveReadinessSummary(rows: AssumptionRow[]): ReadinessSummary {
  if (rows.some(r => r.status === 'unvalidated')) return 'blocked';
  if (rows.some(r => r.status === 'partial'))     return 'needs-evidence';
  return 'ready';
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ReadinessScoreCardProps {
  rows:    AssumptionRow[];
  /** Override the auto-derived summary. */
  summary?: ReadinessSummary;
  className?: string;
}

// ─── ReadinessScoreCard ───────────────────────────────────────────────────────

export function ReadinessScoreCard({
  rows,
  summary,
  className,
}: ReadinessScoreCardProps) {
  const derivedSummary = summary ?? deriveReadinessSummary(rows);
  const validatedCount   = rows.filter(r => r.status === 'validated').length;
  const partialCount     = rows.filter(r => r.status === 'partial').length;
  const unvalidatedCount = rows.filter(r => r.status === 'unvalidated').length;

  return (
    <div className={cn(
      'flex flex-col gap-4 p-4 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border) w-full',
      className,
    )}>

      {/* ─── Summary header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <p className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
            Readiness assessment
          </p>
          <Tag size="md" variant={SUMMARY_VARIANT[derivedSummary]} surface="shadow-border">
            {SUMMARY_LABEL[derivedSummary]}
          </Tag>
        </div>
        <div className="flex items-center gap-3 font-sans [font-size:var(--font-size-sm)] text-(--text-secondary)">
          <span>
            <strong className="text-(--text-primary)">{validatedCount}</strong> validated
          </span>
          <span>
            <strong className="text-(--text-primary)">{partialCount}</strong> partial
          </span>
          <span>
            <strong className="text-(--text-primary)">{unvalidatedCount}</strong> unvalidated
          </span>
        </div>
      </div>

      {/* ─── Assumption rows ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.interactive, delay: i * 0.04 }}
            className="flex items-start justify-between gap-3 p-3 rounded-sm bg-(--bg-surface-secondary)"
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
                {row.label}
              </p>
              {row.evidenceNote && (
                <p className="font-sans [font-size:var(--font-size-xs)] text-(--text-secondary)">
                  {row.evidenceNote}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Tag size="sm" variant={STATUS_VARIANT[row.status]} leadingIcon={STATUS_ICON[row.status]}>
                {STATUS_LABEL[row.status]}
              </Tag>
              {row.evidenceNote && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  icon={<FileText />}
                  aria-label="View evidence"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
