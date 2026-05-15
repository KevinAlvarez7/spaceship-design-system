'use client';

import { motion } from 'motion/react';
import { TrendingDown, TrendingUp, Minus, ArrowRight } from 'lucide-react';
import { Tag } from '@/components/ui';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';
import {
  DASHBOARD_METRICS,
  DASHBOARD_ISSUES,
  DASHBOARD_SIGNAL_BREAKDOWN,
  RENEWAL_SCREENS,
  type DashboardMetric,
  type DashboardIssue,
  type DashboardSignalBreakdown,
  type RenewalScreen,
} from '@/app/_shared/renewal-flow.mock';

// ─── Constants ────────────────────────────────────────────────────────────────

const TONE_TEXT_CLASS = {
  positive: 'text-(--text-status-success)',
  negative: 'text-(--text-status-error)',
  neutral:  'text-(--text-tertiary)',
} as const;

const TONE_ICON = {
  positive: <TrendingUp className="size-3" />,
  negative: <TrendingDown className="size-3" />,
  neutral:  <Minus className="size-3" />,
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface EvidenceDashboardProps {
  metrics?:    DashboardMetric[];
  issues?:     DashboardIssue[];
  signals?:    DashboardSignalBreakdown;
  funnel?:     RenewalScreen[];
  className?:  string;
}

// ─── EvidenceDashboard ────────────────────────────────────────────────────────

export function EvidenceDashboard({
  metrics  = DASHBOARD_METRICS,
  issues   = DASHBOARD_ISSUES,
  signals  = DASHBOARD_SIGNAL_BREAKDOWN,
  funnel   = RENEWAL_SCREENS,
  className,
}: EvidenceDashboardProps) {

  const totalSignals = signals.supports + signals.contradicts + signals.inconclusive;

  return (
    <div className={cn('flex flex-col w-full p-6 gap-6 bg-(--bg-surface-secondary)', className)}>

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <p className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
          Evidence dashboard · Citizen renewal flow
        </p>
        <h2 className="font-serif text-(length:--font-size-xl) leading-(--line-height-xl) font-bold text-(--text-primary)">
          What citizens are showing us
        </h2>
      </div>

      {/* ─── Metric tiles ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <MetricTile key={m.label} metric={m} delay={i * 0.05} />
        ))}
      </div>

      {/* ─── Funnel ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border)">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
            Drop-off across the flow
          </h3>
          <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
            Out of 100 starters
          </span>
        </div>
        <Funnel screens={funnel} />
      </div>

      {/* ─── Signal breakdown + issues ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">

        {/* Signal breakdown */}
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border)">
          <h3 className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
            Signal breakdown
          </h3>
          <SignalBar
            label="Supports the problem"
            count={signals.supports}
            total={totalSignals}
            barClass="bg-(--bg-status-warning)"
          />
          <SignalBar
            label="Contradicts"
            count={signals.contradicts}
            total={totalSignals}
            barClass="bg-(--bg-status-success)"
          />
          <SignalBar
            label="Inconclusive"
            count={signals.inconclusive}
            total={totalSignals}
            barClass="bg-(--bg-status-neutral)"
          />
        </div>

        {/* Top issues */}
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border)">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-sans [font-size:var(--font-size-sm)] font-semibold text-(--text-primary)">
              Top citizen-flagged issues
            </h3>
            <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
              Ranked by frequency
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {issues.map((iss, i) => (
              <motion.li
                key={iss.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springs.interactive, delay: i * 0.04 }}
                className="flex items-center gap-3 p-2 rounded-sm bg-(--bg-surface-secondary)"
              >
                <span className="font-mono [font-size:var(--font-size-sm)] font-semibold text-(--text-primary) w-6 shrink-0">
                  {iss.flagged}
                </span>
                <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-primary) flex-1 min-w-0">
                  {iss.label}
                </span>
                <Tag size="sm" variant="neutral">{iss.step}</Tag>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── MetricTile ───────────────────────────────────────────────────────────────

function MetricTile({ metric, delay = 0 }: { metric: DashboardMetric; delay?: number }) {
  const tone = metric.tone ?? 'neutral';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.interactive, delay }}
      className="flex flex-col gap-1 p-4 rounded-lg bg-(--bg-surface-base) shadow-(--shadow-border)"
    >
      <span className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary)">
        {metric.label}
      </span>
      <span className="font-serif text-(length:--font-size-2xl) leading-(--line-height-2xl) font-bold text-(--text-primary)">
        {metric.value}
      </span>
      {metric.delta && (
        <span className={cn(
          'flex items-center gap-1 font-sans [font-size:var(--font-size-xs)]',
          TONE_TEXT_CLASS[tone],
        )}>
          {TONE_ICON[tone]}
          {metric.delta}
        </span>
      )}
      {metric.helpText && (
        <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
          {metric.helpText}
        </span>
      )}
    </motion.div>
  );
}

// ─── Funnel ───────────────────────────────────────────────────────────────────

function Funnel({ screens }: { screens: RenewalScreen[] }) {
  return (
    <div className="flex items-stretch gap-2">
      {screens.map((s, i) => {
        const widthPct = Math.max(8, s.completed);
        const dropPct = s.entered > 0
          ? Math.round(((s.entered - s.completed) / s.entered) * 100)
          : 0;
        return (
          <div key={s.id} className="flex items-stretch gap-2 flex-1 min-w-0">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-sans [font-size:var(--font-size-xs)] font-semibold text-(--text-primary) truncate">
                  Step {s.step}
                </span>
                <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary)">
                  {s.completed}%
                </span>
              </div>
              <div className="h-3 rounded-sm bg-(--bg-surface-secondary) overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ ...springs.interactive, delay: i * 0.06 }}
                  className={cn(
                    'h-full',
                    s.isFailurePoint
                      ? 'bg-(--bg-status-error)'
                      : 'bg-(--bg-interactive-primary-default)',
                  )}
                />
              </div>
              <span className="font-sans [font-size:var(--font-size-xs)] text-(--text-tertiary) truncate">
                {s.title}
              </span>
            </div>
            {i < screens.length - 1 && (
              <div className="flex flex-col items-center justify-center gap-0.5 px-1 shrink-0">
                <ArrowRight className="size-3 text-(--text-tertiary)" />
                <span className={cn(
                  'font-sans [font-size:var(--font-size-xs)] font-semibold',
                  dropPct >= 30 ? 'text-(--text-status-error)' :
                  dropPct >= 15 ? 'text-(--text-status-warning)' :
                  'text-(--text-tertiary)',
                )}>
                  −{dropPct}%
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SignalBar ────────────────────────────────────────────────────────────────

function SignalBar({
  label,
  count,
  total,
  barClass,
}: {
  label:    string;
  count:    number;
  total:    number;
  barClass: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-primary)">{label}</span>
        <span className="font-mono [font-size:var(--font-size-xs)] text-(--text-tertiary)">
          {count}/{total}
        </span>
      </div>
      <div className="h-2 rounded-sm bg-(--bg-surface-secondary) overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={springs.interactive}
          className={cn('h-full rounded-sm', barClass)}
        />
      </div>
    </div>
  );
}
