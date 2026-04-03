import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArtifactPanelV2, ArtifactToolbarDropdown, ShareableLink } from '@/components/patterns';
import { Button, DropdownMenuItem } from '@/components/ui';
import { Copy } from 'lucide-react';
import { MOCK_ARTIFACTS } from '../_helpers/mocks';

function ArtifactPanelV2Demo() {
  const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);
  return (
    <div className="flex flex-col h-screen bg-(--bg-surface-secondary)">
      <ArtifactPanelV2
        artifacts={MOCK_ARTIFACTS}
        activeId={activeId}
        onSelect={setActiveId}
      />
    </div>
  );
}

const meta = {
  title: 'Patterns/ArtifactPanelV2',
  component: ArtifactPanelV2Demo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Folder-tab artifact panel with scrollable content card and a shimmer sweep animation when content updates.' } },
  },
} satisfies Meta<typeof ArtifactPanelV2Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── With Toolbar ─────────────────────────────────────────────────────────────
// Each tab type gets its own toolbar: preview → ShareableLink, others → version + copy.

const VERSION_ITEMS = (
  <>
    <DropdownMenuItem>v2 (latest)</DropdownMenuItem>
    <DropdownMenuItem>v1</DropdownMenuItem>
  </>
);

function ArtifactPanelWithToolbar() {
  const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);
  const [domain, setDomain] = useState('');

  const activeType = MOCK_ARTIFACTS.find(a => a.id === activeId)?.type;

  const toolbar = activeType === 'preview'
    ? (
      <div className="flex items-center w-full p-2 gap-2">
        <ArtifactToolbarDropdown label="v2 (latest)">{VERSION_ITEMS}</ArtifactToolbarDropdown>
        <ShareableLink value={domain} onChange={setDomain} className="shadow-none rounded bg-(--bg-surface-primary) flex-1 min-w-0" />
      </div>
    )
    : (
      <div className="flex items-center justify-between w-full p-2">
        <ArtifactToolbarDropdown label="v2 (latest)">{VERSION_ITEMS}</ArtifactToolbarDropdown>
        <Button variant="success" size="sm" trailingIcon={<Copy />}>Copy</Button>
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-(--bg-surface-secondary)">
      <ArtifactPanelV2
        artifacts={MOCK_ARTIFACTS}
        activeId={activeId}
        onSelect={setActiveId}
        toolbar={toolbar}
      />
    </div>
  );
}

export const WithToolbar: Story = {
  render: () => <ArtifactPanelWithToolbar />,
};

// ─── With Change Indicators ───────────────────────────────────────────────────

export const WithChangeIndicators: Story = {
  render: () => {
    const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);
    return (
      <div className="flex flex-col h-screen bg-(--bg-surface-secondary)">
        <ArtifactPanelV2
          artifacts={MOCK_ARTIFACTS}
          activeId={activeId}
          onSelect={setActiveId}
          changedIds={new Set(['code'])}
        />
      </div>
    );
  },
};
