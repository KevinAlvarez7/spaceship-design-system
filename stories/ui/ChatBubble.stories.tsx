import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubble } from '@/components/ui';

const meta = {
  title: 'Components/ChatBubble',
  component: ChatBubble,
  parameters: { layout: 'centered' },
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    children:  { control: 'text' },
    asChild:   { table: { disable: true } },
  },
  args: {
    children: 'Make me a dashboard for tracking my workouts',
    surface: 'shadow-border',
  },
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongMessage: Story = {
  args: {
    children: 'Can you build me a full-stack app with authentication, real-time updates, and a beautiful UI that works on mobile too?',
  },
};

export const DefaultSurface: Story = {
  args: { surface: 'default' },
};
