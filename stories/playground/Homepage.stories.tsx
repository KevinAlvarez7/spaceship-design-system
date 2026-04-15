import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { HomepagePage } from '@/components/docs/pages/HomepagePage';

const meta = {
  title: 'Playground/Prototypes/Homepage',
  component: HomepagePage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <>
        <Story />
        {process.env.NODE_ENV === 'development' && <InterfaceKit />}
      </>
    ),
  ],
} satisfies Meta<typeof HomepagePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
