import type { Meta, StoryObj } from '@storybook/react';
import { TypographyPage } from '@/components/docs/pages/TypographyPage';

const meta = {
  title: 'Foundations/Typography',
  component: TypographyPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TypographyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
