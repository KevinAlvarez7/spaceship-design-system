import type { Meta, StoryObj } from '@storybook/react';
import { PrototypeWorkspacePage } from '@/components/docs/pages/PrototypeWorkspacePage';

const meta = {
  title: 'Playground/PrototypeWorkspace',
  component: PrototypeWorkspacePage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PrototypeWorkspacePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
