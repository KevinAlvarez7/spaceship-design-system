import type { Meta, StoryObj } from '@storybook/react';
import { Copy, Trash2, Edit, Share, Settings } from 'lucide-react';
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
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DropdownDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
