import type { Meta, StoryObj } from '@storybook/react';
import { LogoPage } from '@/components/docs/pages/LogoPage';

const meta = {
  title: 'Assets/Logo',
  component: LogoPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LogoPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
