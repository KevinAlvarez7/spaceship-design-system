import type { Meta, StoryObj } from '@storybook/react';
import { ShadowPage } from '@/components/docs/pages/ShadowPage';

const meta = {
  title: 'Foundations/Shadow',
  component: ShadowPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ShadowPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
