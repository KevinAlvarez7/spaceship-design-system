import type { Meta, StoryObj } from '@storybook/react';
import { PreviewPanel } from '@/components/patterns';

const meta = {
  title: 'Patterns/PreviewPanel',
  component: PreviewPanel,
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
} satisfies Meta<typeof PreviewPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <PreviewPanel {...args}>
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
        Preview content goes here
      </div>
    </PreviewPanel>
  ),
};

export const WithContent: Story = {
  args: { title: 'My Dashboard' },
  render: (args) => (
    <PreviewPanel {...args}>
      <iframe
        className="flex-1 border-none"
        srcDoc={`<html><body style="font-family:sans-serif;padding:2rem;background:#f9fafb"><h1>Hello World</h1><p>This is a live preview.</p></body></html>`}
      />
    </PreviewPanel>
  ),
};
