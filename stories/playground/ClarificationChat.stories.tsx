import type { Meta, StoryObj } from '@storybook/react';
import { ClarificationChatDemoPage } from '@/components/docs/pages/ClarificationChatDemoPage';

const meta = {
  title: 'Playground/ClarificationChat',
  component: ClarificationChatDemoPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ClarificationChatDemoPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
