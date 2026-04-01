import type { Meta, StoryObj } from '@storybook/react';
import { PreviewPanelHeader } from '@/components/patterns';

const meta = {
  title: 'Patterns/PreviewPanelHeader',
  component: PreviewPanelHeader,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title:          { control: 'text' },
    onRefresh:      { table: { disable: true } },
    onOpenInNewTab: { table: { disable: true } },
  },
  args: {
    title: 'Preview',
  },
} satisfies Meta<typeof PreviewPanelHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomTitle: Story = {
  args: { title: 'My Landing Page' },
};
