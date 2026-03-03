'use client';

import { RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';

interface PreviewPanelHeaderProps {
  title?: string;
  onRefresh?: () => void;
  onOpenInNewTab?: () => void;
}

export function PreviewPanelHeader({
  title = 'Preview',
  onRefresh,
  onOpenInNewTab,
}: PreviewPanelHeaderProps) {
  return (
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
  );
}
