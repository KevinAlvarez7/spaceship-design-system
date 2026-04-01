import type { Meta, StoryObj } from '@storybook/react';
import { SpacingPage } from '@/components/docs/pages/SpacingPage';

const meta = {
  title: 'Foundations/Spacing',
  component: SpacingPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SpacingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
