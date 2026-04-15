import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ArtifactSegmentedControl } from '@/components/patterns';
import { MOCK_ARTIFACTS } from '../_helpers/mocks';

function ArtifactSegmentedControlDemo() {
  const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);
  const activeArtifact = MOCK_ARTIFACTS.find(a => a.id === activeId) ?? MOCK_ARTIFACTS[0];
  return (
    <div className="flex flex-col h-screen">
      <ArtifactSegmentedControl
        artifacts={MOCK_ARTIFACTS}
        activeId={activeId}
        onSelect={setActiveId}
      />
      <div className="flex-1 p-6 bg-zinc-50 overflow-auto">
        <p className="text-sm text-zinc-500 mb-2">Active: {activeArtifact.title}</p>
        <pre className="text-xs text-zinc-700 whitespace-pre-wrap">{activeArtifact.content || '(empty)'}</pre>
      </div>
    </div>
  );
}

const meta = {
  title: 'Patterns/ArtifactSegmentedControl',
  component: ArtifactSegmentedControlDemo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ArtifactSegmentedControlDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function WithChangedIndicatorsDemo() {
  const [activeId, setActiveId] = useState(MOCK_ARTIFACTS[0].id);
  return (
    <div className="flex flex-col h-screen">
      <ArtifactSegmentedControl
        artifacts={MOCK_ARTIFACTS}
        activeId={activeId}
        onSelect={setActiveId}
        changedIds={new Set(['code'])}
      />
      <div className="flex-1 p-6 bg-zinc-50 flex items-center justify-center text-sm text-zinc-400">
        The &quot;code&quot; tab has a change indicator
      </div>
    </div>
  );
}

export const WithChangedIndicators: Story = {
  render: () => <WithChangedIndicatorsDemo />,
};
