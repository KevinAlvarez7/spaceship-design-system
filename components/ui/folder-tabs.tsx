'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const SPRING = { type: 'spring', stiffness: 200, damping: 24 } as const;

/** Container orchestrates stagger timing for child action buttons. */
const actionsContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
  exit: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

/** Each action button fades + scales in; GPU-composited properties only. */
const actionButtonVariants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.4 },
};

// ─── Context ──────────────────────────────────────────────────────────────────

type FolderTabsContextValue = {
  value: string;
  onChange: (value: string) => void;
  disableMotion: boolean;
  activeActions: ReactNode;
};

const FolderTabsContext = createContext<FolderTabsContextValue | null>(null);

function useFolderTabsContext() {
  const ctx = useContext(FolderTabsContext);
  if (!ctx) throw new Error('FolderTab must be used inside FolderTabs');
  return ctx;
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const folderTabsVariants = cva(
  ['flex items-center w-full', 'font-sans'],
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

export interface FolderTabsProps extends VariantProps<typeof folderTabsVariants> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disableMotion?: boolean;
  layoutId?: string;
  activeActions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface FolderTabProps {
  value: string;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function IconSlot({ icon }: { icon?: ReactNode }) {
  if (!icon) return null;
  return (
    <span className="inline-flex shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4 [&>svg]:[stroke-width:2.75]">
      {icon}
    </span>
  );
}

// ─── FolderTabs ───────────────────────────────────────────────────────────────

export function FolderTabs({
  value: controlledValue,
  defaultValue = '',
  onChange,
  disableMotion = false,
  layoutId: _layoutId,
  surface,
  activeActions,
  children,
  className,
}: FolderTabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  function handleChange(next: string) {
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <FolderTabsContext.Provider value={{ value, onChange: handleChange, disableMotion, activeActions }}>
      <LayoutGroup>
        <div
          role="tablist"
          className={cn(folderTabsVariants({ surface }), className)}
        >
          {children}
        </div>
      </LayoutGroup>
    </FolderTabsContext.Provider>
  );
}

// ─── FolderTab ────────────────────────────────────────────────────────────────

export function FolderTab({
  value,
  disabled = false,
  leadingIcon,
  children,
  className,
}: FolderTabProps) {
  const { value: groupValue, onChange, disableMotion, activeActions } = useFolderTabsContext();
  const isActive = groupValue === value;

  const wrapperClasses = cn(
    'self-stretch shrink-0 overflow-hidden border-r border-(--bg-surface-tertiary) last:border-r-0 flex items-stretch',
    isActive
      ? 'bg-(--bg-surface-base) border-b border-(--bg-surface-tertiary)'
      : 'bg-(--bg-surface-secondary) border-b border-(--bg-surface-tertiary)',
  );

  const buttonClasses = cn(
    'relative z-10 flex items-center gap-2 flex-1 h-full p-2',
    'font-sans [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] whitespace-nowrap',
    'transition-colors duration-(--duration-fast) ease-(--ease-in-out)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
    isActive
      ? 'text-(--text-primary)'
      : 'text-(--text-secondary) hover:text-(--text-primary)',
    className,
  );

  const actionItems = React.Children.toArray(
    React.isValidElement(activeActions) && activeActions.type === React.Fragment
      ? (activeActions.props as { children: ReactNode }).children
      : activeActions
  );

  const actionsContent = disableMotion ? (
    isActive && activeActions ? (
      <span className="flex items-center gap-2 shrink-0 p-2">
        {actionItems}
      </span>
    ) : null
  ) : (
    <AnimatePresence mode="popLayout">
      {isActive && activeActions ? (
        <motion.span
          key="actions"
          className="flex items-center gap-2 shrink-0 p-2"
          variants={actionsContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {actionItems.map((child, index) => (
            <motion.span
              key={index}
              variants={actionButtonVariants}
              transition={SPRING}
              style={{ willChange: 'transform' }}
            >
              {child}
            </motion.span>
          ))}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );

  const content = (
    <>
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        disabled={disabled}
        onClick={() => !disabled && onChange(value)}
        className={buttonClasses}
      >
        <motion.span layout="position" className="flex items-center gap-1.5 px-2">
          <IconSlot icon={leadingIcon} />
          {children}
        </motion.span>
      </button>
      {actionsContent}
    </>
  );

  if (disableMotion) {
    return <div className={cn(wrapperClasses, isActive && 'flex-1')}>{content}</div>;
  }

  return (
    <motion.div
      layout
      transition={{ layout: SPRING }}
      className={cn(wrapperClasses, isActive && 'flex-1')}
      style={{ willChange: 'transform' }}
    >
      {content}
    </motion.div>
  );
}
