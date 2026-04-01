import type { Meta, StoryObj } from '@storybook/react';
import { ColorPage } from '@/components/docs/pages/ColorPage';

const meta = {
  title: 'Foundations/Colors',
  component: ColorPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ColorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
