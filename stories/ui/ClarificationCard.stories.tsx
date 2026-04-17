import type { Meta, StoryObj } from '@storybook/react';
import { Globe, Smartphone, Terminal, Layers, Hammer, Compass, FlaskConical } from 'lucide-react';
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
    weight: {
      control: { type: 'select' },
      options: ['default', 'prominent'],
      table: { category: 'Variants' },
    },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    submitLabel:   { control: 'text', table: { category: 'Content' } },
    questions:     { table: { disable: true } },
    onSubmit:      { table: { disable: true } },
    onClose:       { table: { disable: true } },
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

export const WithIcons: Story = {
  args: {
    questions: [{
      type: 'single',
      label: 'What type of project are you building?',
      options: [
        { label: 'Web app',      icon: <Globe className="h-4 w-4" /> },
        { label: 'Mobile app',   icon: <Smartphone className="h-4 w-4" /> },
        { label: 'API / backend', icon: <Layers className="h-4 w-4" /> },
        { label: 'CLI tool',     icon: <Terminal className="h-4 w-4" /> },
      ],
    }],
  },
};

export const Prominent: Story = {
  args: { weight: 'prominent' },
};

export const CustomSubmitLabel: Story = {
  args: { submitLabel: 'Done', questions: MULTI_SELECT_QUESTION },
};

// ─── Measurement pattern stories ─────────────────────────────────────────────

/** ClarificationCard configured as a session-opening intent gate. */
export const IntentGate: Story = {
  args: {
    weight: 'prominent',
    questions: [{
      type: 'single',
      label: 'What are you here to do today?',
      options: [
        { label: 'Build something specific', icon: <Hammer className="h-4 w-4" /> },
        { label: 'Explore what\'s possible',  icon: <Compass className="h-4 w-4" /> },
        { label: 'Test or validate an idea',  icon: <FlaskConical className="h-4 w-4" /> },
      ],
    }],
  },
};

/** ClarificationCard configured as a post-session follow-up nudge. */
export const PostSessionNudge: Story = {
  args: {
    submitLabel: 'Done',
    onClose: () => {},
    questions: [{
      type: 'multi',
      label: 'How did it go with Spaceship DS?',
      options: [
        'Presented or shared it',
        'Helped us make a decision',
        'Still working on it',
        'Sparked a new idea',
        'Didn\'t end up using it',
      ],
    }],
  },
};

