import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ArtifactPanelV2, ArtifactToolbarDropdown } from '@/components/patterns';
import { DropdownMenuItem } from '@/components/ui';
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

export const WithToolbar: Story = {
  render: () => {
    const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);
    return (
      <div className="flex flex-col h-screen bg-(--bg-surface-secondary)">
        <ArtifactPanelV2
          artifacts={MOCK_ARTIFACTS}
          activeId={activeId}
          onSelect={setActiveId}
          toolbar={
            <div className="px-3 py-1.5">
              <ArtifactToolbarDropdown label="v2 (latest)">
                <DropdownMenuItem>v2 (latest)</DropdownMenuItem>
                <DropdownMenuItem>v1</DropdownMenuItem>
              </ArtifactToolbarDropdown>
            </div>
          }
        />
      </div>
    );
  },
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
