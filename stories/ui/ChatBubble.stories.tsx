import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubble } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const meta = {
  title: 'Components/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Message bubble for user messages in chat interfaces.' } },
  },
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

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'ChatBubble', padding: 'px-4 py-3', radius: 'rounded-sm' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/chat-bubble.tsx"
      preview={<ChatBubble>Make me a dashboard for tracking my workouts</ChatBubble>}
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true } },
};

export const LongMessage: Story = {
  args: {
    children: 'Can you build me a full-stack app with authentication, real-time updates, and a beautiful UI that works on mobile too?',
  },
};

export const DefaultSurface: Story = {
  args: { surface: 'default' },
};

