'use client';

import { useState } from 'react';
import { GridBackground } from '@/components/effects';
import { ArtifactSegmentedControl, ChatPanel } from '@/components/patterns';
import { MOCK_ARTIFACTS } from '@/app/patterns/_shared/artifactData';
import { ArtifactClarificationChat } from './ArtifactClarificationChat';

export function ArtifactNavigationPage() {
  const [activeArtifactId, setActiveArtifactId] = useState(MOCK_ARTIFACTS[0].id);
  const [changedIds, setChangedIds] = useState(new Set(['security', 'research']));

  function handleSelect(id: string) {
    setActiveArtifactId(id);
    setChangedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <div className="relative flex flex-1 overflow-hidden size-full">
      <GridBackground />

      <div className="relative z-10 flex flex-1 flex-col size-full">
        <main className="flex flex-1 min-h-0 gap-6 p-4">
          <div className="flex flex-col w-(--sizing-chat-default) shrink-0 min-h-0">
            <ChatPanel>
              <ArtifactClarificationChat />
            </ChatPanel>
          </div>
          <div className="flex flex-col flex-1 min-w-0 min-h-0">
            <ArtifactSegmentedControl
              artifacts={MOCK_ARTIFACTS}
              activeId={activeArtifactId}
              onSelect={handleSelect}
              changedIds={changedIds}
              onRefresh={() => {}}
              onOpenInNewTab={() => {}}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
