import type { Meta, StoryObj } from '@storybook/react';
import { Copy, Trash2, Edit, Share, Settings } from 'lucide-react';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';

function DropdownDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem leadingIcon={Edit}>Edit</DropdownMenuItem>
        <DropdownMenuItem leadingIcon={Copy}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem leadingIcon={Share}>Share</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem leadingIcon={Settings}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem leadingIcon={Trash2} variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Radix-based dropdown menu with spring-animated content, keyboard navigation, and icon support.' } },
  },
} satisfies Meta<typeof DropdownDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'Content',   padding: 'p-1',         gap: '—',     radius: 'rounded' },
  { part: 'Item',      padding: 'px-2 py-1.5', gap: 'gap-2', radius: 'rounded-md' },
  { part: 'Separator', padding: 'my-1',         gap: '—',     radius: '—', note: '1px horizontal divider' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/dropdown-menu.tsx"
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};

export const WithDisabledItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem leadingIcon={Edit}>Edit</DropdownMenuItem>
        <DropdownMenuItem leadingIcon={Copy} disabled>Duplicate (disabled)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem leadingIcon={Trash2} variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

