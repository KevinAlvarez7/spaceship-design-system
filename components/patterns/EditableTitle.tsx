'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Check, Menu } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface EditableTitleProps {
  title: string;
  onTitleChange?: (newTitle: string) => void;
  onMenuClick?: () => void;
  error?: string;
  className?: string;
}

export function EditableTitle({
  title,
  onTitleChange,
  onMenuClick,
  error,
  className,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const showEditing = isEditing || !!error;

  useEffect(() => {
    if (showEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showEditing]);

  function handlePencilClick() {
    setEditValue(title);
    setIsEditing(true);
  }

  function handleDone() {
    if (error) return;
    onTitleChange?.(editValue);
    setIsEditing(false);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !error) {
      handleDone();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }

  return (
    <div className={cn('flex items-center gap-(--spacing-3xs)', className)}>
      {/* Compound container */}
      <div className="flex items-stretch gap-px rounded-(--radius-lg) shadow-(--shadow-border) bg-(--bg-surface-tertiary) overflow-hidden">
        {/* Menu section (optional) */}
        {onMenuClick && (
          <Button
            variant="secondary"
            size="icon"
            className="rounded-none shrink-0"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu />
          </Button>
        )}

        {/* Field section */}
        <div className="flex items-center bg-(--bg-surface-primary) px-(--spacing-3xs) py-(--spacing-5xs)">
          <AnimatePresence mode="wait" initial={false}>
            {showEditing ? (
              <motion.div
                key="editing"
                className="flex items-center gap-(--spacing-4xs)"
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    'bg-transparent outline-none border-none',
                    'font-sans [font-size:var(--font-size-base)] [line-height:var(--line-height-base)] [font-weight:var(--font-weight-regular)] text-(--text-primary)',
                    'min-w-0 w-auto',
                  )}
                  style={{ width: `${Math.max(editValue.length, 8)}ch` }}
                  aria-label="Edit title"
                />
                <Button
                  variant="success"
                  size="sm"
                  surface="shadow"
                  trailingIcon={<Check />}
                  disabled={!!error}
                  onClick={handleDone}
                >
                  Done
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                className="flex items-center gap-(--spacing-4xs)"
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <span className="font-sans [font-size:var(--font-size-base)] [line-height:var(--line-height-base)] [font-weight:var(--font-weight-bold)] text-(--text-primary) px-(--spacing-5xs)">
                  {title}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handlePencilClick}
                  aria-label="Edit title"
                >
                  <Pencil />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error message (to the right) */}
      <AnimatePresence>
        {error && (
          <motion.span
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-status-error) shrink-0"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
