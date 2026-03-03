'use client';

import { type ReactNode } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';

interface PreviewLinkProps {
  title?: string;
  onRefresh?: () => void;
  onOpenInNewTab?: () => void;
  children?: ReactNode;
}

export function PreviewLink({
  title = 'Preview',
  onRefresh,
  onOpenInNewTab,
  children,
}: PreviewLinkProps) {
  return (
    <div className="flex flex-col overflow-clip rounded-(--radius-4xl) shadow-(--shadow-border) bg-(--bg-surface-base) size-full">
      <div className="bg-(--bg-surface-primary) border-b-2 border-(--bg-surface-secondary) flex shrink-0 items-center justify-between px-(--spacing-2xs) py-(--spacing-2xs)">
        <p className="font-sans [font-size:var(--font-size-lg)] [line-height:var(--line-height-lg)] [font-weight:var(--font-weight-bold)] text-(--text-primary) whitespace-nowrap">
          {title}
        </p>
        <div className="flex items-center gap-(--spacing-3xs)">
          <Button
            variant="secondary"
            surface="shadow"
            size="sm"
            trailingIcon={<RefreshCw />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            surface="shadow"
            size="sm"
            trailingIcon={<ExternalLink />}
            onClick={onOpenInNewTab}
          >
            Open in new tab
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 bg-(--bg-surface-tertiary) overflow-clip">
        {children}
      </div>
    </div>
  );
}
