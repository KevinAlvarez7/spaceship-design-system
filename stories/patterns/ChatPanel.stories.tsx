import type { Meta, StoryObj } from '@storybook/react';
import { ChatPanel } from '@/components/patterns';
import { ChatBubble, ChatMessage } from '@/components/ui';
import { MOCK_CLARIFICATION_QUESTIONS } from '../_helpers/mocks';

const THREAD = (
  <>
    <ChatBubble>Build me a landing page for a SaaS product</ChatBubble>
    <ChatMessage content={"I'll create a compelling landing page. Here's my plan:\n\n1. Hero section with value proposition\n2. Feature highlights grid\n3. Social proof section\n4. Pricing table\n5. CTA footer\n\nShall I start?"} />
    <ChatBubble>Yes, start with the hero</ChatBubble>
    <ChatMessage content="Here's the hero section with a bold headline, subheading, and two CTAs. The gradient background draws focus to the main message." />
  </>
);

const meta = {
  title: 'Patterns/ChatPanel',
  component: ChatPanel,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="h-screen flex justify-center items-stretch bg-zinc-100 p-8">
        <div className="w-(--sizing-chat-default) flex flex-col">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    title:         { control: 'text' },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    children:      { table: { disable: true } },
    input:         { table: { disable: true } },
    clarification: { table: { disable: true } },
    approval:      { table: { disable: true } },
    footerAddon:   { table: { disable: true } },
  },
  args: {
    title: 'Build a SaaS landing page',
    disableMotion: false,
  },
} satisfies Meta<typeof ChatPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInput: Story = {
  args: {
    input: { placeholder: 'Continue the conversation…' },
  },
  render: (args) => (
    <ChatPanel {...args}>{THREAD}</ChatPanel>
  ),
};

export const WithClarification: Story = {
  args: { title: 'New project' },
  render: (args) => (
    <ChatPanel
      {...args}
      clarification={{
        questions: MOCK_CLARIFICATION_QUESTIONS,
        onSubmit: (answers) => console.log('Submitted:', answers),
      }}
    >
      <ChatMessage content="Before I start, let me ask a few quick questions to make sure I build exactly what you need." />
    </ChatPanel>
  ),
};

export const Minimal: Story = {
  render: (args) => (
    <ChatPanel {...args} title="Chat">{THREAD}</ChatPanel>
  ),
};
