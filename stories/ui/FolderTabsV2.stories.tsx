import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FileText, Settings, Star } from 'lucide-react';
import { Button, FolderTabsV2, FolderTabV2 } from '@/components/ui';

const meta = {
  title: 'Playground/Components/FolderTabsV2',
  component: FolderTabsV2,
  tags: ['experimental'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Folder-style tab navigation with shared layout animation for the active indicator and optional leading action slot.' } },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    surface:        { control: { type: 'select' }, options: ['default', 'shadow-border'], table: { category: 'Variants' } },
    disableMotion:  { control: 'boolean', table: { category: 'Motion' } },
    children:       { table: { disable: true } },
    leadingAction:  { table: { disable: true } },
  },
  args: {
    defaultValue: 'v1',
    surface: 'default',
    disableMotion: false,
  },
  render: (args) => (
    <FolderTabsV2 {...args}>
      <FolderTabV2 value="v1">Version 1</FolderTabV2>
      <FolderTabV2 value="v2">Version 2</FolderTabV2>
      <FolderTabV2 value="v3">Version 3</FolderTabV2>
    </FolderTabsV2>
  ),
} satisfies Meta<typeof FolderTabsV2>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Shadow Border ────────────────────────────────────────────────────────────

export const ShadowBorder: Story = {
  args: { surface: 'shadow-border' },
};

// ─── With Icons ───────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  render: () => (
    <div className="w-96">
      <FolderTabsV2 defaultValue="draft">
        <FolderTabV2 value="draft" leadingIcon={<FileText />}>Draft</FolderTabV2>
        <FolderTabV2 value="starred" leadingIcon={<Star />}>Starred</FolderTabV2>
        <FolderTabV2 value="settings" leadingIcon={<Settings />}>Settings</FolderTabV2>
      </FolderTabsV2>
    </div>
  ),
};

// ─── With Leading Action ──────────────────────────────────────────────────────

export const WithLeadingAction: Story = {
  render: () => (
    <div className="w-96">
      <FolderTabsV2
        defaultValue="v1"
        surface="shadow-border"
        leadingAction={<Button size="sm" variant="ghost">+ New</Button>}
      >
        <FolderTabV2 value="v1">Version 1</FolderTabV2>
        <FolderTabV2 value="v2">Version 2</FolderTabV2>
      </FolderTabsV2>
    </div>
  ),
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('v1');
    return (
      <div className="w-96 flex flex-col gap-3">
        <FolderTabsV2 value={value} onChange={setValue}>
          <FolderTabV2 value="v1">Version 1</FolderTabV2>
          <FolderTabV2 value="v2">Version 2</FolderTabV2>
          <FolderTabV2 value="v3">Version 3</FolderTabV2>
        </FolderTabsV2>
        <p className="text-sm text-zinc-500">Active: {value}</p>
      </div>
    );
  },
};
