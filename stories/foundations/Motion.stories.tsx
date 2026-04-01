import type { Meta, StoryObj } from '@storybook/react';
import { MotionPage } from '@/components/docs/pages/MotionPage';

const meta = {
  title: 'Foundations/Motion',
  component: MotionPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MotionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
