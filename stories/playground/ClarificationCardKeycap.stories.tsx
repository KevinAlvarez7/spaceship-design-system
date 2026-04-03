import type { Meta, StoryObj } from '@storybook/react';
import { ClarificationCardKeycap } from '@/components/ui';
import { MOCK_CLARIFICATION_QUESTIONS } from '../_helpers/mocks';

const MULTI_STEP_QUESTIONS = [
  ...MOCK_CLARIFICATION_QUESTIONS,
  {
    type: 'rank' as const,
    label: 'Rank these priorities',
    items: ['Performance', 'Developer experience', 'Accessibility', 'Bundle size'],
  },
];

const meta = {
  title: 'Playground/Components/ClarificationCardKeycap',
  component: ClarificationCardKeycap,
  tags: ['experimental'],
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
    onClose:       { table: { disable: true } },
  },
  args: {
    questions: MOCK_CLARIFICATION_QUESTIONS,
    surface: 'shadow-border',
    disableMotion: false,
  },
} satisfies Meta<typeof ClarificationCardKeycap>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Multi-Step ───────────────────────────────────────────────────────────────

export const MultiStep: Story = {
  args: { questions: MULTI_STEP_QUESTIONS },
};

// ─── Default Surface ──────────────────────────────────────────────────────────

export const DefaultSurface: Story = {
  args: { surface: 'default' },
};
