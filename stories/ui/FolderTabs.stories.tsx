import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';
import { FileText, Settings, Star, Copy } from 'lucide-react';
import { Button, FolderTabs, FolderTab, DropdownMenuItem } from '@/components/ui';
import { ShareableLink, ArtifactToolbarDropdown } from '@/components/patterns';

const meta = {
  title: 'Components/FolderTabs',
  component: FolderTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Tab navigation styled as folder tabs with animated underline indicator and optional icon support.' } },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    children:      { table: { disable: true } },
    activeActions: { table: { disable: true } },
  },
  args: {
    defaultValue: 'v1',
    surface: 'default',
    disableMotion: false,
  },
  render: (args) => (
    <FolderTabs {...args}>
      <FolderTab value="v1">Version 1</FolderTab>
      <FolderTab value="v2">Version 2</FolderTab>
      <FolderTab value="v3">Version 3</FolderTab>
    </FolderTabs>
  ),
} satisfies Meta<typeof FolderTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'FolderTabs',   padding: '—',    gap: '—',       radius: '—', note: 'full-width tab strip container' },
  { part: 'FolderTab',    padding: 'p-2',  gap: 'gap-2',   radius: '—', note: 'tab button area' },
  { part: 'Label span',   padding: 'px-2', gap: 'gap-1.5', radius: '—', note: 'icon + label inner row' },
  { part: 'Actions span', padding: 'p-2',  gap: 'gap-2',   radius: '—', note: 'active tab actions row' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/folder-tabs.tsx"
      preview={
        <div className="w-96">
          <FolderTabs defaultValue="v1">
            <FolderTab value="v1">Version 1</FolderTab>
            <FolderTab value="v2">Version 2</FolderTab>
          </FolderTabs>
        </div>
      }
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true } },
};

export const ShadowBorder: Story = {
  args: { surface: 'shadow-border' },
};

export const WithIcons: Story = {
  render: () => (
    <div className="w-96">
      <FolderTabs defaultValue="draft">
        <FolderTab value="draft" leadingIcon={<FileText />}>Draft</FolderTab>
        <FolderTab value="starred" leadingIcon={<Star />}>Starred</FolderTab>
        <FolderTab value="settings" leadingIcon={<Settings />}>Settings</FolderTab>
      </FolderTabs>
    </div>
  ),
};

// ─── With Toolbar (per-tab) ───────────────────────────────────────────────────

const VERSION_ITEMS = (
  <>
    <DropdownMenuItem>v2 (latest)</DropdownMenuItem>
    <DropdownMenuItem>v1</DropdownMenuItem>
  </>
);

function FolderTabsWithToolbar() {
  const [value, setValue] = useState('brief');
  const [domain, setDomain] = useState('');

  const toolbar = value === 'preview'
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
    <div className="w-[480px]">
      <FolderTabs value={value} onChange={setValue} surface="shadow-border" toolbar={toolbar}>
        <FolderTab value="brief">Project Brief</FolderTab>
        <FolderTab value="code">Code</FolderTab>
        <FolderTab value="preview">Preview</FolderTab>
      </FolderTabs>
    </div>
  );
}

export const WithToolbar: Story = {
  render: () => <FolderTabsWithToolbar />,
};

export const WithActiveActions: Story = {
  render: () => (
    <div className="w-96">
      <FolderTabs
        defaultValue="v1"
        activeActions={<Button size="sm" variant="ghost">+ New</Button>}
      >
        <FolderTab value="v1">Version 1</FolderTab>
        <FolderTab value="v2">Version 2</FolderTab>
      </FolderTabs>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('v1');
    return (
      <div className="w-96 flex flex-col gap-3">
        <FolderTabs value={value} onChange={setValue}>
          <FolderTab value="v1">Version 1</FolderTab>
          <FolderTab value="v2">Version 2</FolderTab>
          <FolderTab value="v3">Version 3</FolderTab>
        </FolderTabs>
        <p className="text-sm text-zinc-500">Active: {value}</p>
      </div>
    );
  },
};

