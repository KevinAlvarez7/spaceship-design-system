import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SortableList } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const INITIAL_ITEMS = [
  'Set up authentication',
  'Build dashboard layout',
  'Add data visualization',
  'Write API endpoints',
  'Deploy to production',
];

function SortableDemo({ surface }: { surface?: 'default' | 'shadow-border' }) {
  const [items, setItems] = useState(INITIAL_ITEMS);
  return (
    <div className="w-80">
      <SortableList items={items} onReorder={setItems} surface={surface} />
    </div>
  );
}

const meta = {
  title: 'Components/SortableList',
  component: SortableDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Drag-and-drop reorderable list with spring animations, keyboard accessibility, and optional dividers.' } },
  },
} satisfies Meta<typeof SortableDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'Container',    padding: '—',         gap: '—',     radius: 'rounded-xl' },
  { part: 'SortableItem', padding: 'px-4 py-3', gap: 'gap-3', radius: 'rounded-lg' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/sortable-list.tsx"
      preview={
        <div className="w-80">
          <SortableList items={INITIAL_ITEMS.slice(0, 3)} onReorder={() => {}} />
        </div>
      }
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};

export const DefaultSurface: Story = {
  args: { surface: 'default' },
};

function WithDividersDemo() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  return (
    <div className="w-80">
      <SortableList items={items} onReorder={setItems} dividers />
    </div>
  );
}

export const WithDividers: Story = {
  render: () => <WithDividersDemo />,
};

function CustomRenderDemo() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  return (
    <div className="w-80">
      <SortableList
        items={items}
        onReorder={setItems}
        renderItem={(item, index) => (
          <span>
            <span className="text-xs text-zinc-400 mr-2">{index + 1}.</span>
            {item}
          </span>
        )}
      />
    </div>
  );
}

export const CustomRender: Story = {
  render: () => <CustomRenderDemo />,
};

