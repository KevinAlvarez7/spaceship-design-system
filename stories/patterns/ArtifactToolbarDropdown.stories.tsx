import type { Meta, StoryObj } from '@storybook/react';
import { ArtifactToolbarDropdown } from '@/components/patterns';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui';

const meta = {
  title: 'Patterns/ArtifactToolbarDropdown',
  component: ArtifactToolbarDropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Version selector dropdown for the artifact panel toolbar — a ghost Button trigger that opens a DropdownMenu.' } },
  },
  argTypes: {
    label:    { control: 'text', table: { category: 'Content' } },
    children: { table: { disable: true } },
  },
  args: {
    label: 'v2 (latest)',
  },
} satisfies Meta<typeof ArtifactToolbarDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <ArtifactToolbarDropdown {...args}>
      <DropdownMenuItem>v2 (latest)</DropdownMenuItem>
      <DropdownMenuItem>v1</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>View history</DropdownMenuItem>
    </ArtifactToolbarDropdown>
  ),
};

// ─── Many Versions ────────────────────────────────────────────────────────────

export const ManyVersions: Story = {
  args: { label: 'v4 (latest)' },
  render: (args) => (
    <ArtifactToolbarDropdown {...args}>
      <DropdownMenuItem>v4 (latest)</DropdownMenuItem>
      <DropdownMenuItem>v3</DropdownMenuItem>
      <DropdownMenuItem>v2</DropdownMenuItem>
      <DropdownMenuItem>v1</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>View full history</DropdownMenuItem>
    </ArtifactToolbarDropdown>
  ),
};
