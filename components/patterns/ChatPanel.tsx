'use client';

import React from 'react';
import { EditableTitle } from '@/components/patterns/EditableTitle';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  children: React.ReactNode;
  /** When provided, renders an EditableTitle header inside the panel. */
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  onMenuClick?: () => void;
  /** Pinned bottom area — accepts ChatInputBox, ClarificationCard, etc. */
  footer?: React.ReactNode;
  /** Constrains panel width with centering. */
  maxWidth?: '2xl';
  className?: string;
}

export function ChatPanel({
  children,
  title,
  onTitleChange,
  onMenuClick,
  footer,
  maxWidth,
  className,
}: ChatPanelProps) {
  const panel = (
    <div className={cn('flex flex-col min-h-0 flex-1', className)}>
      {title !== undefined && (
        <div className="px-4 py-2 shrink-0">
          <EditableTitle
            title={title}
            onTitleChange={onTitleChange}
            onMenuClick={onMenuClick ?? (() => {})}
          />
        </div>
      )}
      <div className="flex-1 min-h-0">
        {children}
      </div>
      {footer && (
        <div className="shrink-0 px-4 pb-4 pt-2">
          {footer}
        </div>
      )}
    </div>
  );

  if (maxWidth === '2xl') {
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <div className="flex-1 min-h-0 max-w-2xl mx-auto w-full flex flex-col">
          {panel}
        </div>
      </div>
    );
  }

  return panel;
}
