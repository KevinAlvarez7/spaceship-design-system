import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/playground/button/v2';

const meta = {
  title: 'Playground/Components/Button/V2',
  component: Button,
  tags: ['experimental'],
  parameters: { layout: 'centered' },
  args: {
    children: 'Button V2',
    variant: 'primary',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};
