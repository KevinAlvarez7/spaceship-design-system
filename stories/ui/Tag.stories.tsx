import type { Meta, StoryObj } from '@storybook/react';
import { Circle } from 'lucide-react';
import { Tag } from '@/components/ui';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['neutral', 'success', 'warning', 'error', 'info'],
      table: { category: 'Variants' },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
      table: { category: 'Variants' },
    },
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    children: { control: 'text' },
    leadingIcon:  { table: { disable: true } },
    trailingIcon: { table: { disable: true } },
    asChild:      { table: { disable: true } },
  },
  args: {
    children: 'Tag',
    variant: 'neutral',
    size: 'md',
    surface: 'default',
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag variant="neutral">Neutral</Tag>
      <Tag variant="success">Success</Tag>
      <Tag variant="warning">Warning</Tag>
      <Tag variant="error">Error</Tag>
      <Tag variant="info">Info</Tag>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag variant="success" leadingIcon={<Circle />}>Active</Tag>
      <Tag variant="error" trailingIcon={<Circle />}>Error</Tag>
      <Tag variant="info" leadingIcon={<Circle />} trailingIcon={<Circle />}>Both</Tag>
    </div>
  ),
};

export const ShadowBorder: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag variant="neutral" surface="shadow-border">Neutral</Tag>
      <Tag variant="success" surface="shadow-border">Success</Tag>
      <Tag variant="warning" surface="shadow-border">Warning</Tag>
      <Tag variant="error" surface="shadow-border">Error</Tag>
      <Tag variant="info" surface="shadow-border">Info</Tag>
    </div>
  ),
};
