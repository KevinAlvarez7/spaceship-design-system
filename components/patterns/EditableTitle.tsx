'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui';

interface EditableTitleProps {
  title: string;
  onEdit?: () => void;
}

export function EditableTitle({ title, onEdit }: EditableTitleProps) {
  return (
    <div className="flex items-center gap-(--spacing-4xs) rounded-(--radius-2xl) shadow-(--shadow-border) bg-(--bg-surface-primary) px-(--spacing-4xs) py-(--spacing-5xs)">
      <span className="font-sans [font-size:var(--font-size-sm)] [line-height:var(--line-height-sm)] [font-weight:var(--font-weight-medium)] text-(--text-primary) px-(--spacing-4xs)">
        {title}
      </span>
      <Button variant="secondary" surface="shadow" size="icon-sm" onClick={onEdit}>
        <Pencil />
      </Button>
    </div>
  );
}
