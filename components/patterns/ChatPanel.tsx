'use client';

import React from 'react';
import { EditableTitle } from '@/components/patterns/EditableTitle';
import { ChatInputBox, ClarificationCard } from '@/components/ui';
import type { ChatInputBoxProps, ClarificationQuestion, ClarificationAnswers } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  children: React.ReactNode;
  // Header
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  onMenuClick?: () => void;
  // Layout
  className?: string;

  /** ChatInputBox props. When provided, renders a ChatInputBox in the footer. */
  input?: ChatInputBoxProps;

  /** When provided, replaces ChatInputBox with ClarificationCard. */
  clarification?: {
    questions: ClarificationQuestion[];
    onSubmit: (answers: ClarificationAnswers) => void;
    surface?: 'default' | 'shadow-border';
  };

  /** Extra content rendered above the footer input/card (e.g., TaskList). */
  footerAddon?: React.ReactNode;
}

export function ChatPanel({
  children,
  title,
  onTitleChange,
  onMenuClick,
  className,
  input,
  clarification,
  footerAddon,
}: ChatPanelProps) {
  const hasFooter = !!(input || clarification || footerAddon);

  const panel = (
    <div className={cn('flex flex-col min-h-0 flex-1 min-w-(--sizing-chat-min) max-w-(--sizing-chat-max)', className)}>
      {title !== undefined && (
        <div className="shrink-0">
          <EditableTitle
            title={title}
            onTitleChange={onTitleChange}
            onMenuClick={onMenuClick ?? (() => {})}
          />
        </div>
      )}
      <div className="flex flex-col flex-1 min-h-0">
        {children}
      </div>
      {hasFooter && (
        <div className="shrink-0">
          {footerAddon}
          {clarification ? (
            <ClarificationCard
              questions={clarification.questions}
              onSubmit={clarification.onSubmit}
              surface={clarification.surface}
            />
          ) : input ? (
            <ChatInputBox {...input} />
          ) : null}
        </div>
      )}
    </div>
  );

  return panel;
}
