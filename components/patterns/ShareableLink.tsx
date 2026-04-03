'use client';

import { useRef } from 'react';
import { Globe, Link } from 'lucide-react';
import useMeasure from 'react-use-measure';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ShareableLinkProps {
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  placeholder?: string;
  onShare?: () => void;
  shareLabel?: string;
  className?: string;
}

const FONT_CLASSES = 'font-sans [font-size:var(--font-size-sm)] [line-height:var(--line-height-sm)]';

export function ShareableLink({
  value,
  onChange,
  suffix = '.on.spaceship.gov.sg',
  placeholder = 'Enter Domain name',
  onShare,
  shareLabel = 'Share',
  className,
}: ShareableLinkProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizerRef, { width: sizerWidth }] = useMeasure();

  return (
    // Outer structural wrapper — input field + Share button side by side, 4px gap, same height.
    <div className="flex items-center gap-1 w-full">
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg shadow-border bg-(--bg-surface-base) px-1.5 py-1.5 overflow-hidden flex-1 min-w-0',
          className,
        )}
      >
        {/* Globe + text group — onClick captures the full area for focus. */}
        <div
          className="flex flex-1 items-center gap-2 px-2 min-w-0 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <Globe className="size-4 text-(--text-secondary) shrink-0" />

          {/* Row: [input][spacer][suffix]
              Input hugs typed text. Spacer fills the gap so suffix stays right. */}
          <div className="relative flex flex-1 items-center min-w-0">

            {/* Invisible sizer — measures only the typed value so width starts at zero */}
            <span
              ref={sizerRef}
              aria-hidden
              className={cn('absolute invisible whitespace-pre pointer-events-none', FONT_CLASSES)}
            >
              {value}
            </span>

            {/* Visual placeholder — absolute so it doesn't affect the spacer/suffix position */}
            {!value && (
              <span
                aria-hidden
                className={cn('absolute inset-0 flex items-center pointer-events-none whitespace-nowrap overflow-hidden', FONT_CLASSES, 'text-(--text-placeholder)')}
              >
                {placeholder}
              </span>
            )}

            {/* Input container — snaps directly to sizer width, no animation */}
            <div
              className="overflow-hidden shrink-0"
              style={{ width: sizerWidth || undefined, minWidth: '2px' }}
            >
              <input
                ref={inputRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                aria-label="Domain name"
                className={cn(
                  'w-full bg-transparent outline-none px-0 py-0',
                  'text-(--text-primary)',
                  FONT_CLASSES,
                )}
              />
            </div>

            {/* Spacer — collapses as the input grows, keeping the suffix pinned right */}
            <span className="flex-1" />

            {/* Suffix */}
            <span className={cn('text-(--text-tertiary) whitespace-nowrap shrink-0', FONT_CLASSES)}>
              {suffix}
            </span>
          </div>
        </div>
      </div>

      {/* Share button — separate element, same height as input via items-stretch on parent */}
      <Button variant="success" size="sm" trailingIcon={<Link />} onClick={onShare} className="shrink-0">
        {shareLabel}
      </Button>
    </div>
  );
}
