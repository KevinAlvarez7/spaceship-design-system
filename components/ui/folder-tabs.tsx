'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const SPRING = { type: 'spring', stiffness: 200, damping: 24 } as const;

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
      <div
        role="tablist"
        className={cn(folderTabsVariants({ surface }), className)}
      >
        {children}
      </div>
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
    isActive && activeActions ? (
      <span className="flex items-center gap-2 shrink-0 p-2">
        {actionItems.map((child, index) => (
          <motion.span
            key={index}
            initial={{ scale: 0.4, width: 0 }}
            animate={{ scale: 1, width: 'auto' }}
            transition={{ ...SPRING, delay: index * 0.04 }}
            style={{ willChange: 'transform' }}
          >
            {child}
          </motion.span>
        ))}
      </span>
    ) : null
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
        <span className="flex items-center gap-1.5 px-2">
          <IconSlot icon={leadingIcon} />
          {children}
        </span>
      </button>
      {actionsContent}
    </>
  );

  if (disableMotion) {
    return <div className={cn(wrapperClasses, isActive && 'flex-1')}>{content}</div>;
  }

  return (
    <motion.div
      initial={false}
      animate={{ flexGrow: isActive ? 1 : 0 }}
      transition={SPRING}
      className={wrapperClasses}
    >
      {content}
    </motion.div>
  );
}
