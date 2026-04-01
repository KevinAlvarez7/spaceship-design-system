import type { Meta, StoryObj } from '@storybook/react';
import { IconsPage } from '@/components/docs/pages/IconsPage';

const meta = {
  title: 'Assets/Icons',
  component: IconsPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof IconsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
