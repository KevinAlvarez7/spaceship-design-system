import type { Meta, StoryObj } from '@storybook/react';
import { PreviewLink } from '@/components/patterns';

const meta = {
  title: 'Patterns/PreviewLink',
  component: PreviewLink,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="h-screen p-8">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title:          { control: 'text' },
    children:       { table: { disable: true } },
    onRefresh:      { table: { disable: true } },
    onOpenInNewTab: { table: { disable: true } },
  },
  args: {
    title: 'Preview',
  },
} satisfies Meta<typeof PreviewLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <PreviewLink {...args}>
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
        Preview content goes here
      </div>
    </PreviewLink>
  ),
};
