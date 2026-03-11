'use client';

import { useState } from 'react';
import { ArtifactSegmentedControl } from '@/components/patterns';
import { MOCK_ARTIFACTS } from '@/app/patterns/_shared/artifactData';

export function ArtifactSegmentedControlDemos() {
  const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);

  return (
    <div className="flex h-[540px]">
      <ArtifactSegmentedControl
        artifacts={MOCK_ARTIFACTS}
        activeId={activeId}
        onSelect={setActiveId}
        onRefresh={() => {}}
        onOpenInNewTab={() => {}}
      />
    </div>
  );
}
