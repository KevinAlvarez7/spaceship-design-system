'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, ChevronDown, ChevronRight, ClipboardCheck } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const taskListVariants = cva(
  ['font-sans', 'flex flex-col', 'rounded overflow-hidden'],
  {
    variants: {
      surface: {
        default:         '',
        'shadow-border': 'shadow-(--shadow-border)',
      },
    },
    defaultVariants: { surface: 'default' },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TaskListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof taskListVariants> {
  items: string[];
  completedCount?: number;
  isActive?: boolean;
  updatedAt?: string;
  defaultExpanded?: boolean;
  disableMotion?: boolean;
}

// ─── TaskList ─────────────────────────────────────────────────────────────────

export function TaskList({
  items,
  completedCount = 0,
  isActive,
  updatedAt,
  defaultExpanded = true,
  disableMotion = false,
  surface,
  className,
  ...props
}: TaskListProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // isActive defaults to true when not all tasks are done
  const active = isActive ?? completedCount < items.length;
  const progressPct = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div
      className={cn(taskListVariants({ surface }), className)}
      {...props}
    >
      <CollapsiblePrimitive.Root open={expanded} onOpenChange={setExpanded}>
        {/* ── Header ── */}
        <CollapsiblePrimitive.Trigger asChild>
          <button
            type="button"
            className="relative flex items-center justify-between px-4 py-3 overflow-hidden bg-(--bg-surface-base) border-b border-(--bg-surface-secondary) cursor-pointer w-full text-left"
          >
            {/* Progress fill — absolute, behind content; scaleX from left (compositor-only) */}
            <ProgressPrimitive.Root
              value={progressPct}
              max={100}
              className="absolute inset-y-0 left-0 w-full overflow-hidden"
            >
              <ProgressPrimitive.Indicator
                className="h-full bg-(--bg-surface-success-base) transition-transform duration-500 ease-out origin-left"
                style={{ transform: `scaleX(${progressPct / 100})` }}
              >
                {!disableMotion && progressPct > 0 && (
                  <motion.span
                    className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, ease: 'linear', repeat: Infinity, repeatDelay: 0.75 }}
                    style={{ willChange: 'transform' }}
                  />
                )}
              </ProgressPrimitive.Indicator>
            </ProgressPrimitive.Root>

            {/* Left: icon + count */}
            <span className="relative z-10 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 shrink-0 text-(--text-primary)" />
              <span className="font-sans [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
                {completedCount}/{items.length} tasks completed
              </span>
            </span>

            {/* Right: timestamp + chevron */}
            <span className="relative z-10 flex items-center gap-2 shrink-0">
              {updatedAt && (
                <span className="font-sans [font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)] text-(--text-tertiary)">
                  {updatedAt}
                </span>
              )}
              <ChevronIcon className="h-4 w-4 text-(--text-tertiary)" />
            </span>
          </button>
        </CollapsiblePrimitive.Trigger>

        {/* ── Body ── */}
        <CollapsiblePrimitive.Content forceMount>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="body"
                initial={disableMotion ? false : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
                animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
                exit={disableMotion ? undefined : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
                transition={springs.interactive}
                className="bg-(--bg-surface-primary)"
              >
            <ol className="flex flex-col gap-3 px-4 py-4 list-none">
              {items.map((task, i) => {
                const isCompleted  = i < completedCount;
                const isInProgress = active && i === completedCount;

                let textClass: string;
                let icon: React.ReactNode;

                if (isCompleted) {
                  textClass = 'text-(--text-primary)';
                  icon = (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-(--bg-interactive-success-default)" />
                  );
                } else if (isInProgress) {
                  textClass = 'text-(--text-secondary)';
                  icon = (
                    <Loader2 className="h-4 w-4 shrink-0 text-(--text-secondary) animate-spin" />
                  );
                } else {
                  textClass = 'text-(--text-placeholder)';
                  icon = (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-(--text-placeholder) opacity-40" />
                  );
                }

                return (
                  <li key={task} className="flex items-center gap-3">
                    <span className="font-sans [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-tertiary) w-4 shrink-0 text-right tabular-nums">
                      {i + 1}
                    </span>
                    <span className={cn('flex-1 font-sans [font-size:var(--font-size-sm)] [line-height:var(--line-height-sm)]', textClass)}>
                      {task}
                    </span>
                    {disableMotion ? (
                      <span className="shrink-0">{icon}</span>
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isCompleted ? 'done' : isInProgress ? 'progress' : 'pending'}
                          className="shrink-0 block"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={springs.interactive}
                          style={{ willChange: 'transform' }}
                        >
                          {icon}
                        </motion.span>
                      </AnimatePresence>
                    )}
                  </li>
                );
              })}
            </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
    </div>
  );
}

