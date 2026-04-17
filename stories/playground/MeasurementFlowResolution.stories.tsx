import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { MeasurementFlowPage } from '@/components/docs/pages/MeasurementFlowPage';

// ─── Resolution — Did the user get what they came for? ────────────────────────

const meta = {
  title: 'Playground/Prototypes/Measurement Flow/Resolution',
  component: MeasurementFlowPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <>
        <Story />
        {process.env.NODE_ENV === 'development' && <InterfaceKit />}
      </>
    ),
    (Story) => (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    initialPhase: {
      control: { type: 'select' },
      options: [
        'homepage', 'intent-gate', 'clarify-1', 'clarify-2',
        'quality-gate', 'impl-questions', 'ack-gate',
        'building', 'resolution', 'nudge', 'done',
      ],
      table: { category: 'Phase' },
    },
    initialPath: {
      control: { type: 'select' },
      options: ['tender', 'explore', 'build'],
      table: { category: 'Phase' },
    },
  },
} satisfies Meta<typeof MeasurementFlowPage>;

export default meta;
type Story = StoryObj<typeof MeasurementFlowPage>;

/** Live task ticker — each build task completes every 2 s. */
export const Building: Story = {
  args: { initialPhase: 'building', initialPath: 'tender' },
};

/** ResolutionPrompt — "Do you have enough to present this?" */
export const ResolutionPrompt: Story = {
  args: { initialPhase: 'resolution', initialPath: 'tender' },
};

/** PostSessionNudge — "How did it go with Spaceship?" */
export const PostSessionNudge: Story = {
  args: { initialPhase: 'nudge', initialPath: 'tender' },
};
