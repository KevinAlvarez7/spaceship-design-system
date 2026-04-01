import type { Meta, StoryObj } from '@storybook/react';
import { AnimationsPage } from '@/components/docs/pages/AnimationsPage';

const meta = {
  title: 'Assets/Animations',
  component: AnimationsPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AnimationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
