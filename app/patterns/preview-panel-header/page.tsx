'use client';

import { PreviewPanelHeader } from '@/components/patterns';

export default function PreviewPanelHeaderPage() {
  return (
    <div className="flex flex-col gap-(--spacing-sm) p-(--spacing-sm)">
      <div className="rounded-(--radius-xl) overflow-clip shadow-(--shadow-border)">
        <PreviewPanelHeader
          onRefresh={() => {}}
          onOpenInNewTab={() => {}}
        />
      </div>
      <div className="rounded-(--radius-xl) overflow-clip shadow-(--shadow-border)">
        <PreviewPanelHeader
          title="Live Preview"
          onRefresh={() => {}}
          onOpenInNewTab={() => {}}
        />
      </div>
    </div>
  );
}
