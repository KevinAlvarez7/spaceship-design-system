'use client';

import { Globe, Link } from 'lucide-react';
import { Button } from '@/components/ui';

interface ShareableLinkProps {
  url: string;
  onShare?: () => void;
  shareLabel?: string;
}

export function ShareableLink({ url, onShare, shareLabel = 'Create Shareable Link' }: ShareableLinkProps) {
  return (
    <div className="flex items-center gap-(--spacing-4xs) rounded-(--radius-2xl) shadow-(--shadow-border) bg-(--bg-surface-primary) px-(--spacing-4xs) py-(--spacing-5xs)">
      <Globe className="size-4 text-(--text-secondary) shrink-0 mx-(--spacing-4xs)" />
      <span className="font-sans [font-size:var(--font-size-sm)] [line-height:var(--line-height-sm)] text-(--text-secondary) whitespace-nowrap">
        {url}
      </span>
      <Button variant="success" size="sm" trailingIcon={<Link />} onClick={onShare}>
        {shareLabel}
      </Button>
    </div>
  );
}
