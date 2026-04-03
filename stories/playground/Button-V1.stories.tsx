import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/playground/button/v1';

const meta = {
  title: 'Playground/Components/Button/V1',
  component: Button,
  tags: ['experimental'],
  parameters: { layout: 'centered' },
  args: {
    children: 'Button V1',
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
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="success">Success</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};
