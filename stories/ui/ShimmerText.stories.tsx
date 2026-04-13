import type { Meta, StoryObj } from '@storybook/react';
import { ShimmerText, ShimmerDots } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const shimmerTextMeta = {
  title: 'Components/ShimmerText',
  component: ShimmerText,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Animated shimmer sweep for loading and streaming text feedback. ShimmerDots provides a compact ellipsis variant.' } },
  },
  argTypes: {
    children: { control: 'text' },
    shimmerClassName: { control: 'text', table: { category: 'Style' } },
  },
  args: {
    children: 'Thinking deeply about your question…',
  },
} satisfies Meta<typeof ShimmerText>;

export default shimmerTextMeta;
type Story = StoryObj<typeof shimmerTextMeta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'ShimmerText', padding: '—', radius: '—', note: 'inline text element — no padding or radius' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/shimmer-text.tsx"
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};

export const LongText: Story = {
  args: {
    children: 'Processing your request with great care and attention to detail, analysing all the nuances…',
  },
};

export const Dots: Story = {
  render: () => <ShimmerDots />,
};

export const TextWithDots: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <ShimmerText>Generating</ShimmerText>
      <ShimmerDots />
    </div>
  ),
};

