import type { Meta, StoryObj } from '@storybook/react';
import { ChatThread, ChatBubble, ChatMessage } from '@/components/ui';

function ThreadDemo({ bare }: { bare?: boolean }) {
  return (
    <div className="w-(--sizing-chat-default)">
      <ChatThread bare={bare}>
        <ChatBubble>Build me a landing page for a SaaS product</ChatBubble>
        <ChatMessage content="I'll create a compelling landing page for you. Here's what I'll include:\n\n- Hero section with clear value proposition\n- Feature highlights\n- Social proof / testimonials\n- Pricing section\n- Call-to-action footer\n\nShall I start?" />
        <ChatBubble>Yes, please start with the hero section</ChatBubble>
        <ChatMessage content="Here's the hero section with a bold headline, subtext, and two CTAs. I've used a gradient background to draw attention." />
      </ChatThread>
    </div>
  );
}

const meta = {
  title: 'Components/ChatThread',
  component: ThreadDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Scrollable container that composes ChatBubble and ChatMessage into a conversation thread.' } },
  },
  argTypes: {
    bare: { control: 'boolean', table: { category: 'Variants' } },
  },
  args: {
    bare: false,
  },
} satisfies Meta<typeof ThreadDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BareMode: Story = {
  args: { bare: true },
};

export const SingleExchange: Story = {
  render: () => (
    <div className="w-(--sizing-chat-default)">
      <ChatThread>
        <ChatBubble>What is the capital of France?</ChatBubble>
        <ChatMessage content="The capital of France is **Paris**. It has been the country's capital since the 10th century and is home to iconic landmarks like the Eiffel Tower and the Louvre." />
      </ChatThread>
    </div>
  ),
};
