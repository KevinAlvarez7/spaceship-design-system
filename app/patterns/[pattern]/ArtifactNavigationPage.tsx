'use client';

import { useState } from 'react';
import { GridBackground } from '@/components/effects';
import { ArtifactSegmentedControl } from '@/components/patterns';
import { MOCK_ARTIFACTS } from '@/app/patterns/_shared/artifactData';
import { ArtifactClarificationChat } from './ArtifactClarificationChat';

export function ArtifactNavigationPage() {
  const [activeArtifactId, setActiveArtifactId] = useState(MOCK_ARTIFACTS[0].id);

  return (
    <div className="relative flex flex-1 overflow-hidden size-full">
      <GridBackground />

      <div className="relative z-10 flex flex-1 flex-col size-full">
        <main className="flex flex-1 min-h-0 gap-6 px-4 pb-4">
          <div className="flex flex-col flex-1 min-w-0">
            <ArtifactClarificationChat />
          </div>
          <div className="flex w-[720px] shrink-0 min-w-0">
            <ArtifactSegmentedControl
              artifacts={MOCK_ARTIFACTS}
              activeId={activeArtifactId}
              onSelect={setActiveArtifactId}
              onRefresh={() => {}}
              onOpenInNewTab={() => {}}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
