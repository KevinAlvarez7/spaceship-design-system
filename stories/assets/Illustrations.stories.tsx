import type { Meta, StoryObj } from '@storybook/react';
import { IllustrationsPage } from '@/components/docs/pages/IllustrationsPage';

const meta = {
  title: 'Assets/Illustrations',
  component: IllustrationsPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof IllustrationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
