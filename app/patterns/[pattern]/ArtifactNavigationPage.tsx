'use client';

import { useState } from 'react';
import { GridBackground } from '@/components/effects';
import { EditableTitle, ShareableLink, ArtifactSegmentedControl } from '@/components/patterns';
import { MOCK_ARTIFACTS } from '@/app/patterns/_shared/artifactData';
import { ArtifactClarificationChat } from './ArtifactClarificationChat';

export function ArtifactNavigationPage() {
  const [projectTitle, setProjectTitle] = useState('Artifact Navigation');
  const [activeArtifactId, setActiveArtifactId] = useState(MOCK_ARTIFACTS[0].id);
  const [domain, setDomain] = useState('');

  return (
    <div className="relative flex flex-1 overflow-hidden size-full">
      <GridBackground />

      <div className="relative z-10 flex flex-1 flex-col size-full">
        <nav className="flex shrink-0 items-center justify-between px-4 py-3 gap-3">
          <EditableTitle
            title={projectTitle}
            onTitleChange={setProjectTitle}
            onMenuClick={() => {}}
          />
          <ShareableLink value={domain} onChange={setDomain} />
        </nav>

        <main className="flex flex-1 min-h-0 gap-6 px-4 pb-4">
          <div className="flex flex-col flex-1 min-w-0">
            <ArtifactClarificationChat />
          </div>
          <div className="flex flex-1 min-w-0">
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
