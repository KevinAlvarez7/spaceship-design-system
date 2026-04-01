import type { Meta, StoryObj } from '@storybook/react';
import { RadiusPage } from '@/components/docs/pages/RadiusPage';

const meta = {
  title: 'Foundations/Radius',
  component: RadiusPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RadiusPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
