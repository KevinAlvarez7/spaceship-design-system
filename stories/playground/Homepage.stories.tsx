import type { Meta, StoryObj } from '@storybook/react';
import { HomepagePage } from '@/components/docs/pages/HomepagePage';

const meta = {
  title: 'Playground/Homepage',
  component: HomepagePage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HomepagePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
