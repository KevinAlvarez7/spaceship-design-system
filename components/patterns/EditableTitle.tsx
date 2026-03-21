'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { PenLine, Check, Menu } from 'lucide-react';
import { Button } from '@/components/ui';
import { springs } from '@/tokens';
import { cn } from '@/lib/utils';

interface EditableTitleProps {
  title: string;
  onTitleChange?: (newTitle: string) => void;
  onMenuClick: () => void;
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
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
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
    <div className={cn('flex items-center gap-3', className)}>
      {/* Menu button — outside the pill */}
      <Button
        variant="secondary"
        size="icon-lg"
        className="shrink-0"
        onClick={onMenuClick}
        icon={<Menu />}
        aria-label="Toggle sidebar"
        surface="shadow"
      />
      {/* Pill — layout FLIP for flexGrow change (B-tier), NO overflow-hidden */}
      <motion.div
        layout
        transition={{ layout: springs.interactive }}
        className={cn(
          showEditing ? 'bg-(--bg-surface-base) flex-1' : 'bg-(--bg-surface-primary)',
          'flex items-center rounded-lg shadow-(--shadow-border)',
        )}
      >
        {/* Title section — overflow-hidden clips text during transition */}
        <div className="flex items-center gap-1.5 overflow-hidden flex-1 p-2">
          {showEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                'flex-1 p-0 min-w-0',
                'bg-transparent outline-none border-none',
                'font-sans [font-size:var(--font-size-base)] [line-height:var(--line-height-base)] [font-weight:var(--font-weight-regular)] text-(--text-primary)',
              )}
              aria-label="Edit title"
            />
          ) : (
            <>
              <span className="font-sans [font-size:var(--font-size-base)] [line-height:var(--line-height-base)] [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
                {title}
              </span>
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={handlePencilClick}
                aria-label="Edit title"
                icon={<PenLine className="text-(--primary-500)" />}
              />
            </>
          )}
        </div>

        {/* Actions section — outside overflow-hidden, never clipped */}
        {showEditing && (
          <span className="flex items-center shrink-0 p-2">
            <motion.span
              initial={{ scale: 0.4, opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
              animate={{ scale: 1, opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
              transition={springs.interactive}
              style={{ willChange: 'transform' }}
            >
              <Button
                variant="success"
                size="sm"
                trailingIcon={<Check />}
                disabled={!!error}
                onClick={handleDone}
                aria-label="Save title"
              >Done</Button>
            </motion.span>
          </span>
        )}
      </motion.div>

      {/* Error message (to the right) */}
      {error && (
        <span className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-status-error) shrink-0">
          {error}
        </span>
      )}
    </div>
  );
}
