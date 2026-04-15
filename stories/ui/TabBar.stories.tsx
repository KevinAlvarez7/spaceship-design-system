import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Code, Eye, Settings } from 'lucide-react';
import { TabBar, TabBarItem } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const meta = {
  title: 'Components/TabBar',
  component: TabBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Horizontal tab bar with animated selection pill indicator, optional icons, and surface variants.' } },
  },
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    children:      { table: { disable: true } },
  },
  args: {
    surface: 'default',
    defaultValue: 'preview',
    disableMotion: false,
  },
  render: (args) => (
    <TabBar {...args}>
      <TabBarItem value="preview">Preview</TabBarItem>
      <TabBarItem value="code">Code</TabBarItem>
      <TabBarItem value="settings">Settings</TabBarItem>
    </TabBar>
  ),
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

function TabBarPreview() {
  const [value, setValue] = useState('a');
  return (
    <TabBar value={value} onChange={setValue}>
      <TabBarItem value="a">Files</TabBarItem>
      <TabBarItem value="b">Preview</TabBarItem>
    </TabBar>
  );
}

const COMPOSITION: CompositionEntry[] = [
  { part: 'TabBar',      padding: 'p-1',         gap: 'gap-0.5', radius: 'rounded-lg' },
  { part: 'TabBarItem',  padding: 'px-3 py-1.5', gap: 'gap-1.5', radius: 'rounded-md' },
  { part: 'Active pill', padding: '—',            gap: '—',       radius: 'rounded-md', note: 'shared layout motion element' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/tab-bar.tsx"
      preview={<TabBarPreview />}
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};

export const ShadowBorder: Story = {
  args: { surface: 'shadow-border' },
};

export const WithIcons: Story = {
  render: () => (
    <TabBar defaultValue="preview">
      <TabBarItem value="preview" leadingIcon={<Eye />}>Preview</TabBarItem>
      <TabBarItem value="code" leadingIcon={<Code />}>Code</TabBarItem>
      <TabBarItem value="settings" leadingIcon={<Settings />}>Settings</TabBarItem>
    </TabBar>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState('preview');
  return (
    <div className="flex flex-col items-center gap-4">
      <TabBar value={value} onChange={setValue}>
        <TabBarItem value="preview">Preview</TabBarItem>
        <TabBarItem value="code">Code</TabBarItem>
        <TabBarItem value="settings">Settings</TabBarItem>
      </TabBar>
      <p className="text-sm text-zinc-500">Active: {value}</p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const WithDisabled: Story = {
  render: () => (
    <TabBar defaultValue="preview">
      <TabBarItem value="preview">Preview</TabBarItem>
      <TabBarItem value="code">Code</TabBarItem>
      <TabBarItem value="settings" disabled>Settings</TabBarItem>
    </TabBar>
  ),
};

