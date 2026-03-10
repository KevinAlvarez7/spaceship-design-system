'use client';

import { useState, useRef, useEffect } from 'react';
import { PenLine, Check, Menu } from 'lucide-react';
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
      <div className="bg-(--bg-surface-base) rounded-lg shadow-(--shadow-border)">
        <div className="flex items-center w-fit gap-4 px-1.5 py-1.5">
          {/* Menu button (optional) — inline at start of field */}
          {onMenuClick && (
            <Button
              variant="secondary"
              size="icon-sm"
              className="shrink-0"
              onClick={onMenuClick}
              icon={<Menu />}
              aria-label="Open menu"
              surface="shadow"
            />
          )}
          {showEditing ? (
            <>
              <div className="relative">
                <span
                  aria-hidden
                  className="invisible whitespace-pre font-sans [font-size:var(--font-size-base)] [line-height:var(--line-height-base)] [font-weight:var(--font-weight-semibold)]"
                >
                  {editValue.length >= title.length ? editValue : title}
                </span>
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    'absolute inset-0 w-full p-0',
                    'bg-transparent outline-none border-none',
                    'font-sans [font-size:var(--font-size-base)] [line-height:var(--line-height-base)] [font-weight:var(--font-weight-regular)] text-(--text-primary)',
                  )}
                  aria-label="Edit title"
                />
              </div>
              <Button
                variant="success"
                size="icon-sm"
                icon={<Check />}
                disabled={!!error}
                onClick={handleDone}
                aria-label="Save title"
              />
            </>
          ) : (
            <>
              <span className="font-sans [font-size:var(--font-size-base)] [line-height:var(--line-height-base)] [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
                {title}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handlePencilClick}
                aria-label="Edit title"
                icon={<PenLine className="text-(--primary-500)" />}
              />
            </>
          )}
        </div>
      </div>

      {/* Error message (to the right) */}
      {error && (
        <span className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-status-error) shrink-0">
          {error}
        </span>
      )}
    </div>
  );
}
