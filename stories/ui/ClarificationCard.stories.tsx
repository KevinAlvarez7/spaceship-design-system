import type { Meta, StoryObj } from '@storybook/react';
import { ClarificationCard, type ClarificationQuestion } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

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

const MULTI_SELECT_QUESTION: ClarificationQuestion[] = [
  {
    type: 'multi',
    label: 'Which features do you need?',
    options: ['Authentication', 'Database', 'File uploads', 'Email notifications', 'Payments'],
  },
];

const RANK_QUESTION: ClarificationQuestion[] = [
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
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Multi-step clarification form with single-select, multi-select, and ranked question types.' } },
  },
  render: (args) => (
    <div className="w-(--sizing-chat-default)">
      <ClarificationCard {...args} />
    </div>
  ),
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

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'ClarificationCard', padding: '—',        gap: '—',     radius: 'rounded-lg', note: 'from CVA base in clarification-card-shared.tsx' },
  { part: 'Drag handle',       padding: 'py-2',      gap: '—',     radius: '—' },
  { part: 'Content zone',      padding: 'px-4',      gap: 'gap-3', radius: '—' },
  { part: 'Option row',        padding: 'p-3',       gap: 'gap-4', radius: 'rounded-md' },
  { part: 'Number badge',      padding: '—',         gap: '—',     radius: 'rounded',    note: 'w-6 h-6 fixed size' },
  { part: 'Status footer',     padding: 'p-2',       gap: '—',     radius: '—' },
  { part: 'Button footer',     padding: 'p-3',       gap: 'gap-2', radius: '—' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/clarification-card.tsx"
      preview={
        <div className="w-(--sizing-chat-default)">
          <ClarificationCard questions={SINGLE_QUESTION} disableMotion />
        </div>
      }
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};

export const MultiSelect: Story = {
  args: { questions: MULTI_SELECT_QUESTION },
};

export const Rank: Story = {
  args: { questions: RANK_QUESTION },
};

export const MultiStep: Story = {
  args: { questions: MULTI_QUESTIONS },
};

export const WithFreeText: Story = {
  args: { questions: WITH_FREE_TEXT },
};

export const DefaultSurface: Story = {
  args: { surface: 'default' },
};

