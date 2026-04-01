'use client';

import { useState } from 'react';
import { Globe, Link, Copy } from 'lucide-react';
import { Button, DropdownMenuItem } from '@/components/ui';
import { ArtifactPanelV2, ArtifactToolbarDropdown } from '@/components/patterns';
import { MOCK_ARTIFACTS } from '@/app/_shared/artifactData';
import type { Artifact } from '@/components/patterns';

// ─── Toolbar helpers ──────────────────────────────────────────────────────────

const VERSION_ITEMS = (
  <>
    <DropdownMenuItem>Version 1</DropdownMenuItem>
    <DropdownMenuItem>Version 2</DropdownMenuItem>
  </>
);

function PrototypeToolbar() {
  return (
    <div className="flex items-center w-full">
      <div className="px-2 py-1.5">
        <ArtifactToolbarDropdown label="Version 1">{VERSION_ITEMS}</ArtifactToolbarDropdown>
      </div>
      <div className="flex flex-1 items-center gap-2 p-2 border-l border-(--bg-surface-tertiary) bg-(--bg-surface-primary)">
        <div className="flex flex-1 items-center gap-2 px-2 py-1 min-w-0">
          <Globe className="size-4 shrink-0 text-(--text-tertiary)" />
          <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-placeholder) flex-1 truncate">
            Enter your domain name
          </span>
          <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-tertiary) shrink-0">
            .on.spaceship.gov.sg
          </span>
        </div>
        <Button variant="success" size="sm" trailingIcon={<Link />}>Share</Button>
      </div>
    </div>
  );
}

function DocumentToolbar() {
  return (
    <div className="flex items-center justify-between w-full p-2">
      <ArtifactToolbarDropdown label="Version 1">{VERSION_ITEMS}</ArtifactToolbarDropdown>
      <Button variant="success" size="sm" trailingIcon={<Copy />}>Copy</Button>
    </div>
  );
}

// ─── Demos ────────────────────────────────────────────────────────────────────

export function ArtifactPanelV2BasicDemo() {
  const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);
  const activeArtifact = MOCK_ARTIFACTS.find(a => a.id === activeId) ?? MOCK_ARTIFACTS[0];

  const toolbar = activeArtifact.type === 'prototype'
    ? <PrototypeToolbar />
    : <DocumentToolbar />;

  return (
    <div className="flex h-[540px] w-full">
      <ArtifactPanelV2
        artifacts={MOCK_ARTIFACTS}
        activeId={activeId}
        onSelect={setActiveId}
        toolbar={toolbar}

      />
    </div>
  );
}

export function ArtifactPanelV2NoToolbarDemo() {
  const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);

  return (
    <div className="flex h-[540px] w-full">
      <ArtifactPanelV2
        artifacts={MOCK_ARTIFACTS}
        activeId={activeId}
        onSelect={setActiveId}

      />
    </div>
  );
}

export function ArtifactPanelV2WithEditsDemo() {
  const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);
  const [changedIds, setChangedIds] = useState(new Set(['security', 'prototype']));
  const activeArtifact = MOCK_ARTIFACTS.find(a => a.id === activeId) ?? MOCK_ARTIFACTS[0];

  function handleSelect(id: string) {
    setActiveId(id);
    setChangedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const toolbar = activeArtifact.type === 'prototype'
    ? <PrototypeToolbar />
    : <DocumentToolbar />;

  return (
    <div className="flex h-[540px] w-full">
      <ArtifactPanelV2
        artifacts={MOCK_ARTIFACTS}
        activeId={activeId}
        onSelect={handleSelect}
        changedIds={changedIds}
        toolbar={toolbar}

      />
    </div>
  );
}

// Subset of artifacts to demonstrate the prototype toolbar specifically
const PROTOTYPE_ARTIFACTS: Artifact[] = [
  MOCK_ARTIFACTS.find(a => a.id === 'brief')!,
  MOCK_ARTIFACTS.find(a => a.id === 'prototype')!,
];

export function ArtifactPanelV2PrototypeToolbarDemo() {
  const [activeId, setActiveId] = useState('prototype');
  const activeArtifact = PROTOTYPE_ARTIFACTS.find(a => a.id === activeId) ?? PROTOTYPE_ARTIFACTS[0];

  const toolbar = activeArtifact.type === 'prototype'
    ? <PrototypeToolbar />
    : <DocumentToolbar />;

  return (
    <div className="flex h-[540px] w-full">
      <ArtifactPanelV2
        artifacts={PROTOTYPE_ARTIFACTS}
        activeId={activeId}
        onSelect={setActiveId}
        toolbar={toolbar}

      />
    </div>
  );
}
