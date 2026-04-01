import type { Meta, StoryObj } from '@storybook/react';
import { ClarificationCard, type ClarificationQuestion } from '@/components/ui';

const SINGLE_QUESTION: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'What type of project are you building?',
    options: ['Web app', 'Mobile app', 'API / backend', 'CLI tool'],
  },
];

const MULTI_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'What type of project are you building?',
    options: ['Web app', 'Mobile app', 'API / backend', 'CLI tool'],
  },
  {
    type: 'multi',
    label: 'Which features do you need?',
    options: ['Authentication', 'Database', 'File uploads', 'Email notifications', 'Payments'],
  },
  {
    type: 'rank',
    label: 'Rank these priorities from most to least important',
    items: ['Performance', 'Developer experience', 'Accessibility', 'Bundle size'],
  },
];

const WITH_FREE_TEXT: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'What framework should we use?',
    options: ['Next.js', 'Remix', 'SvelteKit', 'Nuxt'],
    freeText: true,
  },
];

const meta = {
  title: 'Components/ClarificationCard',
  component: ClarificationCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-(--sizing-chat-default)">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    questions:     { table: { disable: true } },
    onSubmit:      { table: { disable: true } },
  },
  args: {
    questions: SINGLE_QUESTION,
    surface: 'shadow-border',
    disableMotion: false,
  },
} satisfies Meta<typeof ClarificationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleSelect: Story = {};

export const MultiStep: Story = {
  args: { questions: MULTI_QUESTIONS },
};

export const WithFreeText: Story = {
  args: { questions: WITH_FREE_TEXT },
};

export const DefaultSurface: Story = {
  args: { surface: 'default' },
};
