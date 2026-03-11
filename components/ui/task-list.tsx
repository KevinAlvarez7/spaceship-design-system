'use client';

import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const taskListVariants = cva(
  ['flex flex-col', 'rounded-xl overflow-hidden'],
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
  disableMotion?: boolean;
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px bg-(--bg-surface-tertiary)" />;
}

// ─── TaskList ─────────────────────────────────────────────────────────────────

export function TaskList({
  items,
  completedCount = 0,
  disableMotion = false,
  surface,
  className,
  ...props
}: TaskListProps) {
  return (
    <div
      className={cn(taskListVariants({ surface }), 'bg-(--bg-surface-base)', className)}
      {...props}
    >
      {/* Task rows */}
      <div className="flex flex-col">
        {items.map((task, i) => {
          const isDone = i < completedCount;
          return (
            <div key={task}>
              {i > 0 && <Divider />}
              <div className="flex items-center gap-3 px-4 py-2.5">
                <span className="shrink-0">
                  {disableMotion ? (
                    isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-(--bg-interactive-success-default)" />
                    ) : (
                      <Circle className="h-4 w-4 text-(--text-tertiary)" />
                    )
                  ) : (
                    <AnimatePresence mode="wait">
                      {isDone ? (
                        <motion.span
                          key="check"
                          className="block"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={springs.interactive}
                          style={{ willChange: 'transform' }}
                        >
                          <CheckCircle2 className="h-4 w-4 text-(--bg-interactive-success-default)" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="circle"
                          className="block"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Circle className="h-4 w-4 text-(--text-tertiary)" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  )}
                </span>
                <span
                  className={cn(
                    'font-sans [font-size:var(--font-size-sm)] [line-height:var(--line-height-sm)]',
                    isDone
                      ? 'text-(--text-tertiary) line-through'
                      : 'text-(--text-primary)',
                  )}
                >
                  {task}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer bar */}
      <Divider />
      <div className="px-4 py-2">
        <span className="[font-size:var(--font-size-xs)] text-(--text-tertiary)">
          {completedCount} of {items.length} complete
        </span>
      </div>
    </div>
  );
}
