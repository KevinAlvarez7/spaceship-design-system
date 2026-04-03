import type { Meta, StoryObj } from '@storybook/react';
import { ShimmerText, ShimmerDots } from '@/components/ui';

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
