import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackForm } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const meta = {
  title: 'Components/FeedbackForm',
  component: FeedbackForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Expandable feedback button that morphs into an inline textarea form. Click the trigger to expand; Cancel or submit to collapse.',
      },
    },
  },
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    submitLabel:   { control: 'text' },
    placeholder:   { control: 'text' },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    onSubmit:      { table: { disable: true } },
    onCancel:      { table: { disable: true } },
  },
  args: {
    surface: 'shadow-border',
    submitLabel: 'Request Changes',
    placeholder: "Describe the changes you'd like...",
    disableMotion: false,
  },
  render: (args) => (
    <div className="w-80">
      <FeedbackForm {...args} />
    </div>
  ),
} satisfies Meta<typeof FeedbackForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabels: Story = {
  args: {
    submitLabel: 'Send Feedback',
    placeholder: 'What would you like to change?',
  },
};

export const DefaultSurface: Story = {
  args: { surface: 'default' },
};

export const DisableMotion: Story = {
  args: { disableMotion: true },
};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'FeedbackForm',   padding: '—',               gap: '—',     radius: '—',          note: 'outer wrapper, position relative' },
  { part: 'Trigger button', padding: 'p-3',             gap: 'gap-1', radius: 'rounded-sm', note: 'collapsed state, full width' },
  { part: 'Form container', padding: '—',               gap: '—',     radius: 'rounded-sm', note: 'expanded state, overflow-hidden' },
  { part: 'Textarea area',  padding: 'px-3 pt-3 pb-2',  gap: '—',     radius: '—' },
  { part: 'Button row',     padding: 'px-3 pb-3',       gap: 'gap-2', radius: '—',          note: 'Cancel + Submit' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/feedback-form.tsx"
      preview={
        <div className="w-80">
          <FeedbackForm disableMotion />
        </div>
      }
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};
