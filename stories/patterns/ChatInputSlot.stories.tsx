import type { Meta, StoryObj } from '@storybook/react';
import { ChatInputSlot } from '@/components/patterns';
import { MOCK_CLARIFICATION_QUESTIONS } from '../_helpers/mocks';

const meta = {
  title: 'Patterns/ChatInputSlot',
  component: ChatInputSlot,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-(--sizing-chat-default)">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    mode:          { control: { type: 'select' }, options: ['input', 'clarification'] },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    clarification: { table: { disable: true } },
    input:         { table: { disable: true } },
  },
  args: {
    mode: 'input',
    disableMotion: false,
  },
} satisfies Meta<typeof ChatInputSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InputMode: Story = {
  args: {
    mode: 'input',
    input: {
      placeholder: 'Explore any problems, prototype any ideas…',
    },
  },
};

export const ClarificationMode: Story = {
  args: {
    mode: 'clarification',
    clarification: {
      questions: MOCK_CLARIFICATION_QUESTIONS,
      onSubmit: (answers) => console.log('Submitted:', answers),
    },
  },
};
