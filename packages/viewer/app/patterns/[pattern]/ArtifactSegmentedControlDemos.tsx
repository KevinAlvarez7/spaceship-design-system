'use client';

import { useState } from 'react';
import { ArtifactSegmentedControl } from '@spaceship/design-system';
import { MOCK_ARTIFACTS } from '@/app/_shared/artifactData';

export function ArtifactSegmentedControlDemos() {
  const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);

  return (
    <div className="flex h-[540px] w-full">
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

export function ArtifactSegmentedControlWithEditsDemos() {
  const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);
  const [changedIds, setChangedIds] = useState(new Set(['security', 'research']));

  function handleSelect(id: string) {
    setActiveId(id);
    setChangedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <div className="flex h-[540px] w-full">
      <ArtifactSegmentedControl
        artifacts={MOCK_ARTIFACTS}
        activeId={activeId}
        onSelect={handleSelect}
        changedIds={changedIds}
        onRefresh={() => {}}
        onOpenInNewTab={() => {}}
      />
    </div>
  );
}
