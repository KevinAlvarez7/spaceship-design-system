import type { Meta, StoryObj } from '@storybook/react';
import { Thinking, ThinkingDots, ThinkingShip, ThinkingLogo, ThinkingSaucer } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const meta = {
  title: 'Components/Thinking',
  component: Thinking,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Thinking indicator family: Thinking (card), ThinkingDots (inline), ThinkingShip, ThinkingLogo, ThinkingSaucer.' } },
  },
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    shimmerVariant: {
      control: { type: 'select' },
      options: ['blob', 'linear', 'subtle'],
      table: { category: 'Variants' },
    },
    dots:         { control: 'boolean', table: { category: 'State' } },
    textScramble: { control: 'boolean', table: { category: 'State' } },
    disableMotion:{ control: 'boolean', table: { category: 'Motion' } },
    children:     { control: 'text' },
  },
  args: {
    children: 'Thinking',
    surface: 'default',
    shimmerVariant: 'blob',
    dots: true,
    textScramble: false,
    disableMotion: false,
  },
} satisfies Meta<typeof Thinking>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'ThinkingDots',    variant: 'surface=default',         padding: '—',           radius: '—' },
  { part: 'ThinkingDots',    variant: 'surface=shadow-border',   padding: '—',           radius: 'rounded-sm', note: 'pill container' },
  { part: 'ThinkingShip',    variant: 'surface=default',         padding: '—',           radius: '—' },
  { part: 'ThinkingShip',    variant: 'surface=shadow-border',   padding: '—',           radius: 'rounded-sm', note: 'pill container' },
  { part: 'ThinkingSaucer',  variant: 'surface=default',         padding: '—',           radius: '—' },
  { part: 'ThinkingSaucer',  variant: 'surface=shadow-border',   padding: '—',           radius: 'rounded-sm', note: 'pill container' },
  { part: 'Thinking',        variant: 'surface=default',         padding: '—',           radius: '—',           gap: 'gap-2' },
  { part: 'Thinking',        variant: 'surface=shadow-border',   padding: 'px-2 py-0.5', radius: 'rounded-full', gap: 'gap-2' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/thinking.tsx"
      preview={<Thinking disableMotion>Thinking</Thinking>}
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};

export const TextScramble: Story = {
  args: { textScramble: true },
};

export const ShadowBorder: Story = {
  args: { surface: 'shadow-border' },
};

export const AllShimmerVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Thinking shimmerVariant="blob">Blob shimmer</Thinking>
      <Thinking shimmerVariant="linear">Linear shimmer</Thinking>
      <Thinking shimmerVariant="subtle">Subtle shimmer</Thinking>
    </div>
  ),
};

export const Indicators: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <ThinkingDots />
      <ThinkingShip />
      <ThinkingLogo />
      <ThinkingSaucer />
    </div>
  ),
};

