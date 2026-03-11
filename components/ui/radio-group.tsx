'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Context ──────────────────────────────────────────────────────────────────

type RadioGroupContextValue = {
  value: string;
  onChange: (value: string) => void;
  disableMotion: boolean;
  indicator: 'radio' | 'none';
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error('RadioItem must be used inside RadioGroup');
  return ctx;
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const radioGroupVariants = cva(
  ['flex flex-col', 'bg-(--bg-surface-base)', 'rounded-xl overflow-hidden'],
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

export interface RadioGroupProps
  extends VariantProps<typeof radioGroupVariants> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  dividers?: boolean;
  disableMotion?: boolean;
  indicator?: 'radio' | 'none';
  children: ReactNode;
  className?: string;
}

export interface RadioItemProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

// ─── RadioGroup ───────────────────────────────────────────────────────────────

export function RadioGroup({
  value: controlledValue,
  defaultValue = '',
  onChange,
  dividers = true,
  disableMotion = false,
  indicator = 'radio',
  surface,
  children,
  className,
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  function handleChange(next: string) {
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <RadioGroupContext.Provider value={{ value, onChange: handleChange, disableMotion, indicator }}>
      <div
        className={cn(radioGroupVariants({ surface }), className)}
        role="radiogroup"
      >
        {dividers
          ? splitWithDividers(children)
          : children}
      </div>
    </RadioGroupContext.Provider>
  );
}

// ─── RadioItem ────────────────────────────────────────────────────────────────

export function RadioItem({ value, disabled = false, children }: RadioItemProps) {
  const { value: groupValue, onChange, disableMotion, indicator } = useRadioGroupContext();
  const isSelected = groupValue === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={disabled}
      onClick={() => !disabled && onChange(value)}
      className={cn(
        'group/radio',
        'flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg',
        'transition-colors duration-(--duration-fast) ease-(--ease-in-out)',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)',
        'disabled:pointer-events-none disabled:opacity-50',
        isSelected ? 'bg-(--bg-surface-secondary)' : 'hover:bg-(--bg-surface-secondary)',
      )}
    >
      {/* Radio indicator */}
      {indicator === 'radio' && (
        <span
          className={cn(
            'flex items-center justify-center shrink-0',
            'w-5 h-5 rounded-full',
            isSelected
              ? 'bg-(--bg-interactive-primary-default)'
              : 'bg-(--bg-surface-base) shadow-(--shadow-border)',
          )}
        >
          {isSelected && (
            disableMotion ? (
              <span className="w-2 h-2 rounded-full bg-(--text-inverse)" />
            ) : (
              <motion.span
                className="w-2 h-2 rounded-full bg-(--text-inverse)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springs.interactive}
                style={{ willChange: 'transform' }}
              />
            )
          )}
        </span>
      )}

      {children}
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="mx-4 h-px bg-(--bg-surface-secondary)" />;
}

function splitWithDividers(children: ReactNode): ReactNode {
  const arr = Array.isArray(children) ? children : [children];
  return arr.flatMap((child, i) =>
    i === 0 ? [child] : [<Divider key={`divider-${i}`} />, child],
  );
}
