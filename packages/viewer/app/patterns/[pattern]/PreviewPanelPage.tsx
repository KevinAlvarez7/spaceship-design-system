'use client';

import { useState } from 'react';
import { Preview } from '@/components/viewer/Preview';
import { PreviewPanel } from '@spaceship/design-system';

const DEMO_URL = 'https://spaceship.design';

export function PreviewPanelPage() {
  const [key, setKey] = useState(0);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Preview Panel</h1>
        <p className="mt-2 text-sm text-zinc-500">Embeddable iframe preview with refresh and open-in-new-tab controls.</p>
      </div>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Interactive Demo</h2>
        <Preview label="Interactive Demo" className="h-[32rem]">
          <div className="h-full min-h-0 w-full">
            <PreviewPanel
              onRefresh={() => setKey(k => k + 1)}
              onOpenInNewTab={() => window.open(DEMO_URL, '_blank')}
            >
              <iframe
                key={key}
                src={DEMO_URL}
                className="w-full h-full border-0"
                title="Preview"
              />
            </PreviewPanel>
          </div>
        </Preview>
      </section>
    </div>
  );
}
