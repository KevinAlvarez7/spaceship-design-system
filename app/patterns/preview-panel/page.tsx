'use client';

import { useState } from 'react';
import { PreviewPanel } from '@/components/patterns';

const DEMO_URL = 'https://spaceship.design';

export default function PreviewPanelPage() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col gap-(--spacing-sm) p-(--spacing-sm) h-full min-h-0">
      <div className="flex-1 min-h-0">
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
    </div>
  );
}
