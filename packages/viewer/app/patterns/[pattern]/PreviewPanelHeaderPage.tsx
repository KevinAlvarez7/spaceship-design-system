'use client';

import { Preview } from '@/components/viewer/Preview';
import { PreviewPanelHeader } from '@spaceship/design-system';

export function PreviewPanelHeaderPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Preview Panel Header</h1>
        <p className="mt-2 text-sm text-zinc-500">Header bar for preview panels with title, refresh, and open-in-new-tab actions.</p>
      </div>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variants</h2>
        <Preview label="Variants">
          <div className="flex flex-col gap-4 w-full">
            <div className="rounded-xl overflow-clip shadow-(--shadow-border)">
              <PreviewPanelHeader
                onRefresh={() => {}}
                onOpenInNewTab={() => {}}
              />
            </div>
            <div className="rounded-xl overflow-clip shadow-(--shadow-border)">
              <PreviewPanelHeader
                title="Live Preview"
                onRefresh={() => {}}
                onOpenInNewTab={() => {}}
              />
            </div>
          </div>
        </Preview>
      </section>
    </div>
  );
}
