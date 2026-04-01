import type { Meta, StoryObj } from '@storybook/react';
import { ArtifactNavigationPage } from '@/components/docs/pages/ArtifactNavigationPage';

const meta = {
  title: 'Playground/ArtifactNavigation',
  component: ArtifactNavigationPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ArtifactNavigationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
